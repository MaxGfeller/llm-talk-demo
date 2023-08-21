<script setup>
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { HumanMessage } from 'langchain/schema'
import { PromptTemplate } from 'langchain/prompts'

const runtimeConfig = useRuntimeConfig()

const result = ref('')
const jokeType = ref('')
const isLoading = ref(false)

const chat = new ChatOpenAI({
  modelName: 'gpt-4-0613',
  openAIApiKey: runtimeConfig.public.openAiApiKey
})

const prompt = PromptTemplate.fromTemplate(
  `Tell us a {jokeType} joke about web development.`
);


const generate = async () => {
  isLoading.value = true
  const formattedPrompt = await prompt.format({
    jokeType: jokeType.value
  });

  const response = await chat.predictMessages([
    new HumanMessage(formattedPrompt)
  ]);

  result.value = response.content.replaceAll('\n', '<br />')
  isLoading.value = false
}
</script>
<template>
  <div class="">
    <PromptContainer>Tell us a <input class="px-2 py-1 border-none" placeholder="funny" v-model="jokeType"> joke about web
      development.</PromptContainer>
    <AppButton class="mt-2" :disabled="isLoading" @click="generate()">Generate</AppButton>
    <p class="mt-8" v-html="result"></p>
  </div>
</template>