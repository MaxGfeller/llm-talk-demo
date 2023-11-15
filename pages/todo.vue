<script setup>
const isLoading = ref(false)
const prompt = ref('')
const newTodo = ref('')
const todos = ref([])
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