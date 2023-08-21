import { readFile } from 'fs/promises'

export default defineEventHandler(async (event) => {
  const { file } = getQuery(event)

  const content = await readFile(file, 'utf8')
  const lines = content.split('\n')
  return {
    content: lines.map((line, index) => `${index + 1}: ${line}`).join('\n')
  }
})