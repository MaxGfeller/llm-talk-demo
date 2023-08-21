import { readFile, writeFile } from 'fs/promises'

export default defineEventHandler(async (event) => {
  const { file, type, line, code } = await readBody(event)

  let content = ''
  try {
    content = await readFile(file, 'utf8')
  } catch (err) {}

  const lines = content.split('\n')

  switch (type) {
    case 'insert':
      lines.splice(line - 1, 0, code)
      break;
    case 'edit':
      lines[line - 1] = code
      break;
    case 'delete':
      lines.splice(line - 1, 1)
      break;
  }

  content = lines.join('\n')
  await writeFile(file, content, 'utf8')

  return
})