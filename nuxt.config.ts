// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'LLM Demo'
    }
  },
  runtimeConfig: {
    public: {
      openAiApiKey: process.env.OPENAI_API_KEY
    }
  },
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss']
})
