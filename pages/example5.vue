<script setup>
import { initializeAgentExecutorWithOptions } from 'langchain/agents'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { Tool } from 'langchain/tools'

const runtimeConfig = useRuntimeConfig()

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

const tools = [new CodeListTool(), new CodeViewTool(), new CodeEditTool()]

const model = new ChatOpenAI({
  modelName: 'gpt-4-0613',
  temperature: 0,
  openAIApiKey: runtimeConfig.public.openAiApiKey
})

const executor = await initializeAgentExecutorWithOptions(tools, model, {
  agentType: 'openai-functions',
  verbose: true,
  agentArgs: {
    prefix: `You are WebDevGPT, a helpful assistant that can help to make changes in a web application. The application is built using Nuxt 3 and TailwindCSS. Only ask the user for help if you already tried the tools. The user is currently on page example5 (pages/example5.vue). The global styles (including used font) are defined in assets/index.css.`
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
  <div class="w-full">
    <PromptContainer>
      <textarea class="w-full border-gray-200" :rows="5" v-model="prompt"></textarea>
    </PromptContainer>
    <AppButton @click="generate()" class="mt-2" :disabled="!prompt.trim().length || isLoading">Generate</AppButton>
    <p class="mt-8 italic" v-html="response"></p>
  </div>
</template>
