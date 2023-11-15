<script setup>
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { HumanMessage } from 'langchain/schema'
import { PromptTemplate } from 'langchain/prompts'

const runtimeConfig = useRuntimeConfig()

const result = ref('')
const sentence = ref('')
const isLoading = ref(false)

const chat = new ChatOpenAI({
  modelName: 'gpt-4-0613',
  openAIApiKey: runtimeConfig.public.openAiApiKey
})

const prompt = PromptTemplate.fromTemplate(
  `Rewrite the following sentence: "{sentence}". Make it sound like it was written by a professional copywriter.`
)

const generate = async () => {
  isLoading.value = true
  const formattedPrompt = await prompt.format({
    sentence: sentence.value
  });

  const response = await chat.predictMessages([
    new HumanMessage(formattedPrompt)
  ]);

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