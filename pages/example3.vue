<script setup>
import {
  ChatPromptTemplate
} from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'

const runtimeConfig = useRuntimeConfig()

const isLoading = ref(false)
const url = ref('')
const document = ref(null)
const prompt = ref('')
const response = ref('')
const messages = ref([])

const model = new ChatOpenAI({
  modelName: 'gpt-4',
  openAIApiKey: runtimeConfig.public.openAiApiKey
})

const chatPromptTemplate = ChatPromptTemplate.fromMessages([
  ['system', 'You are a helpful assistant that answers questions about the following excerpt from a website titled {title}:\n\n{content}'],
])

const fetchContent = async () => {
  isLoading.value = true
  document.value = null
  const { data } = await useFetch(`/api/contents?url=${encodeURIComponent(url.value)}`)
  document.value = data.value
  isLoading.value = false

  messages.value = await chatPromptTemplate.formatMessages({
    title: document.value.title,
    content: document.value.content
  })
}

const generate = async () => {
  isLoading.value = true

  messages.value.push(new HumanMessage({ content: prompt.value }))
  prompt.value = ''
  const response = await model.invoke(messages.value)

  messages.value.push(response)

  isLoading.value = false
}

</script>
<template>
  <div class="w-full">
    <PageTitle>Chat with an article</PageTitle>
    <div class="flex items-center w-full space-x-2">
      <input class="w-full border-gray-200" type="url" placeholder="URL to an article" v-model="url">
      <AppButton :disabled="isLoading || !url.trim().length" @click="fetchContent">Load</AppButton>
    </div>
    <div v-if="document" class="mt-2 text-sm text-gray-500">Website loaded</div>
    <div v-if="document" class="">
      <div class="flex flex-col w-full space-y-2">
        <template v-for="message in messages" :key="message.content">
          <div v-if="!(message instanceof SystemMessage)" class="min-w-0 max-w-[75%] p-2 text-sm rounded-lg"
            :class="{ 'self-start bg-gray-200': message instanceof AIMessage, 'self-end bg-blue-200': message instanceof HumanMessage }">
            {{ message.content }}
          </div>
        </template>
      </div>
      <PromptContainer class="mt-8">
        <textarea class="w-full border-gray-200" :rows="2" v-model="prompt"></textarea>
      </PromptContainer>
      <AppButton @click="generate()" class="mt-2" :disabled="!prompt.trim().length || isLoading">Send</AppButton>
      <p class="mt-8" v-html="response"></p>
    </div>
  </div>
</template>