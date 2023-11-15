import { readdir } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  const paths = []

  const processPaths = async (basePath) => {
    const files = await readdir(basePath, { withFileTypes: true })

    for (const file of files) {
      const path = join(basePath, file.name)

      if (file.isDirectory()) {
        if (path.includes('node_modules') || path.includes('.nuxt') || path.includes('processing') || path.includes('.git')) continue
        await processPaths(path)
      } else {
        paths.push(path)
      }
    }
  }

  await processPaths('./')

  console.log('returning paths', paths)
  return paths
})