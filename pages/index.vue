<script setup>
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { HumanMessage } from 'langchain/schema'

const runtimeConfig = useRuntimeConfig()

const result = ref('')
const isLoading = ref(false)

const chat = new ChatOpenAI({
  modelName: 'gpt-4-0613',
  openAIApiKey: runtimeConfig.public.openAiApiKey
})

const generate = async () => {
  isLoading.value = true
  const response = await chat.predictMessages([
    new HumanMessage('For a new git repository, suggest a name to use. It should consist of two lowercase words, joined together by a dash. The words don\'t have to make sense together.')
  ])

  result.value = response.content.replaceAll('\n', '<br />')
  isLoading.value = false
}
</script>
<template>
  <div class="">
    <PageTitle>Repo name suggestion</PageTitle>
    <PromptContainer>For a new git repository, suggest a name to use. It should consist of two lowercase words, joined together by a dash. The words don't have to make sense together.</PromptContainer>
    <AppButton class="mt-2" :disabled="isLoading" @click="generate()">Generate</AppButton>
    <p class="mt-8" v-html="result"></p>
  </div>
</template>