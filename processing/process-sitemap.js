import { readFileSync } from 'fs'
import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'
import fetch from 'node-fetch'
import { ChromaClient, OpenAIEmbeddingFunction } from 'chromadb';

const client = new ChromaClient();
const embedder = new OpenAIEmbeddingFunction({ openai_api_key: process.env.OPENAI_API_KEY })
const collection = await client.getOrCreateCollection({ name: 'nuxt_docs', embeddingFunction: embedder })

const contents = readFileSync('./sitemap-nuxt.txt', { encoding: 'utf8' })
const urls = contents.split('\n').filter((line) => line.includes('/docs/'))

const documents = []

const generateUniqueId = () => {
  return Math.random().toString(36).substring(2, 9)
}

const fetchDocument = async (url) => {
  const response = await fetch(url)
  const html = await response.text()
  const doc = new JSDOM(html, { url })
  const reader = new Readability(doc.window.document)
  const article = reader.parse()

  documents.push({ id: generateUniqueId(), metadata: { url, title: article.title }, document: article.textContent })
}

for (let i = 0; i < urls.length; i++) {
  await fetchDocument(urls[i])
}

console.log('fetched all documents')

await collection.add({
  ids: documents.map((doc) => doc.id),
  metadatas: documents.map((doc) => doc.metadata),
  documents: documents.map((doc) => doc.document)
})

console.log('added all documents to collection')