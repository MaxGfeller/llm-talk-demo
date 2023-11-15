import { readFileSync, readdirSync } from 'fs'
import { ChromaClient, OpenAIEmbeddingFunction } from 'chromadb'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import matter from 'gray-matter'

const generateUniqueId = () => {
  return Math.random().toString(36).substring(2, 9)
}

const documents = []

const docsRoot = './processing/nuxt-website-repo/content/en/docs'
const docsFolders = readdirSync(docsRoot).filter((name) => !name.includes('.md'))

const processFile = async (fileContents) => {
  const frontMatter = matter(fileContents).data

  // Remove front matter from markdown string
  const mdContents = fileContents.replace(/^---([\s\S.]*?)---/m, '')

  const splitter = RecursiveCharacterTextSplitter.fromLanguage('markdown', {
    chunkSize: 800,
    chunkOverlap: 0,
  });

  const generatedDocuments = await splitter.createDocuments([mdContents]);
  generatedDocuments.forEach((doc) => {
    documents.push({
      document: doc.pageContent,
      metadata: frontMatter,
      id: generateUniqueId()
    })
  })
}

const processDocsFolder = async (folder) => {
  const files = readdirSync(`${docsRoot}/${folder}`)

  await Promise.all(files.map(async (fileName) => {
    const contents = readFileSync(`${docsRoot}/${folder}/${fileName}`, { encoding: 'utf-8' })
    await processFile(contents, fileName)
  }))
}

await Promise.all(docsFolders.map(processDocsFolder))

console.log('documents', documents)

const client = new ChromaClient();
const embedder = new OpenAIEmbeddingFunction({ openai_api_key: process.env.OPENAI_API_KEY })
await client.deleteCollection({ name: 'nuxt_docs' })
const collection = await client.getOrCreateCollection({ name: 'nuxt_docs', embeddingFunction: embedder })

await collection.add({
  ids: documents.map((doc) => doc.id),
  metadatas: documents.map((doc) => doc.metadata),
  documents: documents.map((doc) => doc.document)
})

console.log('added all documents to collection')