<script setup>
import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate } from '@langchain/core/prompts'

const runtimeConfig = useRuntimeConfig()

const result = ref('')
const sentence = ref('')
const isLoading = ref(false)

const chat = new ChatOpenAI({
  modelName: 'gpt-4-0613',
  openAIApiKey: runtimeConfig.public.openAiApiKey
})

const prompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are a helpful assistant that can help with copywriting. Rewrite the sentence that the user sends to make it sound like it was written by a professional copywriter.'],
  ['human', 'Sentence: {input}']
])

const generate = async () => {
  isLoading.value = true
  const formattedPrompt = await prompt.format({
    input: sentence.value
  });

  const response = await chat.invoke(formattedPrompt)

  result.value = response.content.replaceAll('\n', '<br />')
  isLoading.value = false
}
</script>
<template>
  <div class="w-full">
    <PageTitle>Copywriting Assistant</PageTitle>
    <PromptContainer class="mt-8">
      <textarea class="w-full border-gray-200" :rows="5" v-model="sentence"></textarea>
    </PromptContainer>
    <AppButton class="mt-2" :disabled="isLoading" @click="generate()">Generate</AppButton>
    <p class="mt-8" v-html="result"></p>
  </div>
</template>