<script setup>
import { Chroma } from 'langchain/vectorstores/chroma'
import { Ollama } from 'langchain/llms/ollama'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { RetrievalQAChain } from 'langchain/chains'
import { PromptTemplate } from 'langchain/prompts'
import { StringOutputParser } from 'langchain/schema/output_parser'
import Markdown from 'markdown-it'
import { RunnableSequence } from 'langchain/schema/runnable'
import { formatDocumentsAsString } from 'langchain/util/document'

const messages = ref([])

const route = useRoute()
const runtimeConfig = useRuntimeConfig()

const useOllama = computed(() => {
  return !!route.query.ollama
})

const md = Markdown({
  html: true,
  linkify: true,
  typographer: true
})

const prompt = ref('')
const response = ref('')
const isLoading = ref(false)

const ollama = new Ollama({
  baseUrl: 'http://localhost:11434',
  model: 'llama2:13b-chat',
})

const model = new ChatOpenAI({
  modelName: 'gpt-4',
  openAIApiKey: runtimeConfig.public.openAiApiKey
})

const vectorStore = await Chroma.fromExistingCollection(new OpenAIEmbeddings({
  openAIApiKey: runtimeConfig.public.openAiApiKey
}), {
  collectionName: 'nuxt_docs'
})

const retriever = vectorStore.asRetriever()

const formatChatHistory = () => {
  return messages.value.map((message) => {
    return `${message.type}: ${message.text}`
  }).join('\n\n')
};


const questionPrompt = PromptTemplate.fromTemplate(
  `Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.
  ----------------
  CONTEXT: {context}
  ----------------
  CHAT HISTORY: {chatHistory}
  ----------------
  QUESTION: {question}
  ----------------
  Helpful Answer:`
)

const chain = RunnableSequence.from([
  {
    question: (input) =>
      input.question,
    chatHistory: (input) =>
      input.chatHistory ?? '',
    context: async (input) => {
      const relevantDocs = await retriever.getRelevantDocuments(input.question);
      const serialized = formatDocumentsAsString(relevantDocs);
      return serialized;
    },
  },
  questionPrompt,
  useOllama ? ollama : model,
  new StringOutputParser(),
])

const generate = async () => {
  isLoading.value = true
  response.value = ''

  messages.value.push({ type: 'human', text: prompt.value })

const stream = await chain.stream({
  question: prompt.value,
  chatHistory: formatChatHistory()
})

  messages.value.push({ type: 'ai', text: '' })
  prompt.value = ''

  let result = ''
  console.log('stream', stream)
  for await (const chunk of stream) {
    messages.value[messages.value.length - 1].text += chunk
  }

  isLoading.value = false
}
</script>
<template>
  <div class="w-full">
    <PageTitle>Ask the Nuxt documentation <span v-if="useOllama" class="font-normal text-gray-500">(using Ollama)</span></PageTitle>
    <!-- <PromptContainer class="mt-8">
      <textarea class="w-full border-gray-200" :rows="5" v-model="prompt"></textarea>
    </PromptContainer>
    <AppButton @click="generate()" class="mt-2" :disabled="!prompt.trim().length || isLoading">Generate</AppButton> -->
    <p class="mt-8 responseContainer" v-html="response"></p>
    <div class="flex flex-col w-full space-y-2">
      <template v-for="message in messages" :key="message.text">
        <div class="min-w-0 max-w-[75%] p-2 text-sm rounded-lg"
          :class="{ 'self-start bg-gray-200': message.type === 'ai', 'self-end bg-blue-200': message.type === 'human' }" v-html="md.render(message.text)">
        </div>
      </template>
    </div>
    <PromptContainer class="mt-8">
      <textarea class="w-full border-gray-200" :rows="2" v-model="prompt"></textarea>
    </PromptContainer>
    <AppButton @click="generate()" class="mt-2" :disabled="!prompt.trim().length || isLoading">Send</AppButton>
  </div>
</template>
<style>
.responseContainer p {
  @apply mb-4;
}

.responseContainer code {
  @apply bg-gray-100 p-1 rounded text-xs;
}
</style>