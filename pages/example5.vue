<script setup>
import { initializeAgentExecutorWithOptions } from 'langchain/agents'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { Tool } from 'langchain/tools'

const runtimeConfig = useRuntimeConfig()

const newTodo = ref('')
const todos = ref([])

const prompt = ref('')
const response = ref('')
const isLoading = ref(false)

class CodeListTool extends Tool {
  async call() {
    const { data } = await useFetch('/api/code/list')
    return JSON.stringify(data.value)
  }
  name = 'codeList'
  description = `You can get a list of all files in the project. There is no input to the tool, you will receive a list of all files.`
}

class CodeViewTool extends Tool {
  async call(arg) {
    console.log('called code view tool with arg', arg, typeof arg)

    if (!arg.file) {
      throw new Error('You need to specify a file')
    }

    const { data } = await useFetch(`/api/code/view?file=${arg.file}`)
    return data.value.content
  }
  name = 'codeView'
  description = `You can view the code. The input to the tool needs to be in JSON format (see instructions in "<>" below):
  {
    "file": "<The file that should be viewed, full path>"
  }

  The answer will be the full content of the file, each line prefixed with the line number and a colon. Here's an example if you want to view the file "app.vue". The input to the tool should look like this:

  { "file": "app.vue" }`
}

class CodeEditTool extends Tool {
  async call(arg) {
    const { data } = await useFetch(`/api/code/edit`, {
      method: 'POST',
      body: {
        file: arg.file,
        line: arg.line,
        type: arg.type,
        code: arg.code
      }
    })
    return 'Done'
  }
  name = 'codeEdit'
  description = `You can make changes to the code. The input to the tool needs to be in JSON format (see instructions in "<>" below):
  {
    "type": "<insert|delete|edit>",
    "file": "<The file that should be edited, full path>",
    "line": "<The line number that should be edited>",
    "code": "<The code that should be inserted, deleted or edited>"
  }

  All properties are required. If you want to insert code, it will be inserted at the specified line, meaning it will come before the code that currently is on this line.

  Here's an example if you want to insert a line of code in the file "app.vue" on line 12. The code you want to insert is "console.log('hello world')". The input to the tool should look like this:
  { "file": "app.vue", "line": 12": "type": "insert", "code": "console.log(\'hello world\')" }`
}

class TodoListTool extends Tool {
  async call() {
    return JSON.stringify(todos.value)
  }
  name = 'listTodos'
  description = 'See a list of all todos. The return value is gonna be in JSON format, for every todo there is a text and a done field that indicates if the item was already done.'
}

class CreateTodoTool extends Tool {
  async call(args) {
    todos.value.push({ done: false, text: args.input, createdAt: Date.now() })
  }
  name = 'createTodo'
  description = 'Create a new todo. The parameter needs to be a string with the text of the item.'
}

class FinishTodoTool extends Tool {
  async call(args) {
    console.log('finish', args)
    const todo = todos.value.find(({ createdAt }) => createdAt === +args.input)

    if (todo) todo.done = true
  }
  name = 'finishTodo'
  description = 'Mark a todo as done. Input needs to be the createdAt of the task.'
}

const tools = [new CodeListTool(), new CodeViewTool(), new CodeEditTool(), new TodoListTool(), new CreateTodoTool(), new FinishTodoTool()]

const model = new ChatOpenAI({
  modelName: 'gpt-4-0613',
  temperature: 0,
  openAIApiKey: runtimeConfig.public.openAiApiKey
})

const executor = await initializeAgentExecutorWithOptions(tools, model, {
  agentType: 'openai-functions',
  verbose: true,
  agentArgs: {
    prefix: `You are a helpful assistant that can help with using a todo application. But you can also assist to make changes in a web application. The application is built using Nuxt 3 and TailwindCSS. Only ask the user for help if you already tried the tools. The user is currently on page example5 (pages/example5.vue). The global styles (including used font) are defined in assets/index.css.`
  }
})

const generate = async () => {
  isLoading.value = true
  response.value = ''

  const result = await executor.run(prompt.value)
  response.value = result

  prompt.value = ''
  isLoading.value = false
}

</script>
<template>
  <div class="w-screen">
    <PageTitle class="block mx-auto text-center">App Copilot</PageTitle>
    <div class="flex justify-center space-x-4">
      <div class="w-full max-w-sm">
        <input type="text" class="w-full" placeholder="Add a todo" v-model="newTodo" @keydown.enter.prevent="() => {
          todos.push({ text: newTodo, done: false, createdAt: Date.now() })
          newTodo = ''
        }">
        <div class="flex flex-col gap-2 mt-4">
          <label v-for="todo in todos.filter(todo => !todo.done)" :key="todo.createdAt" class="flex items-center p-4 space-x-4 bg-gray-100 rounded">
            <input :checked="todo.done" type="checkbox" @change="(evt) => {
              todo.done = evt.target.checked
            }">
            <span>{{ todo.text }}</span>
          </label>
          <label v-for="todo in todos.filter(todo => todo.done)" :key="todo.createdAt" class="flex items-center p-4 space-x-4 bg-gray-100 rounded opacity-50">
            <input :checked="todo.done" type="checkbox" @change="(evt) => {
              todo.done = evt.target.checked
            }">
            <span>{{ todo.text }}</span>
          </label>
        </div>
      </div>
      <div class="w-full max-w-sm">
        <PromptContainer>
          <textarea class="w-full border-gray-200" :rows="5" v-model="prompt"></textarea>
        </PromptContainer>
<AppButton @click="generate()" class="mt-2" :disabled="!prompt.trim().length || isLoading">Generate</AppButton>
        <p class="mt-8 italic" v-html="response"></p>
      </div>
    </div>
  </div>
</template>
