<script setup>
import { Chroma } from 'langchain/vectorstores/chroma'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { RetrievalQAChain } from 'langchain/chains'
import { PromptTemplate } from 'langchain/prompts'
import Markdown from 'markdown-it'

const runtimeConfig = useRuntimeConfig()

const md = Markdown({
  html: true,
  linkify: true,
  typographer: true
})

const prompt = ref('')
const response = ref('')
const isLoading = ref(false)

const model = new ChatOpenAI({
  modelName: 'gpt-4-0613',
  openAIApiKey: runtimeConfig.public.openAiApiKey
})

const vectorStore = await Chroma.fromExistingCollection(new OpenAIEmbeddings({
  openAIApiKey: runtimeConfig.public.openAiApiKey
}), {
  collectionName: 'nuxt_docs'
})

const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
  verbose: true, prompt: PromptTemplate.fromTemplate(`Use the following articles to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer. Format your answer as Markdown. \n\nArticles:

{context}

Question: {question}`)
})

const generate = async () => {
  isLoading.value = true
  response.value = ''
  const { text } = await chain.call({ query: prompt.value })
  response.value = md.render(text)
  isLoading.value = false
}
</script>
<template>
  <div class="w-full">
    <PromptContainer class="mt-8">
      <textarea class="w-full border-gray-200" :rows="5" v-model="prompt"></textarea>
    </PromptContainer>
    <AppButton @click="generate()" class="mt-2" :disabled="!prompt.trim().length || isLoading">Generate</AppButton>
    <p class="mt-8 responseContainer" v-html="response"></p>
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