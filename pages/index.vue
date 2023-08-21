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
    new HumanMessage('Suggest 5 cool and clever names for a Web Meetup Community based in Basel, Switzerland. List just the names, without explanation.')
  ]);

  result.value = response.content.replaceAll('\n', '<br />')
  isLoading.value = false
}
</script>
<template>
  <div class="">
    <PromptContainer>Suggest 5 cool and clever names for a Web Meetup Community based in Basel, Switzerland. List just the
      names, without explanation.</PromptContainer>
    <AppButton class="mt-2" :disabled="isLoading" @click="generate()">Generate</AppButton>
    <p class="mt-8" v-html="result"></p>
  </div>
</template>