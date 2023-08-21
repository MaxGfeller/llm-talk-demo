import fetch from 'node-fetch'
import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'

export default defineEventHandler(async (event) => {
  const { url } = getQuery(event)
  const response = await fetch(url)
  const html = await response.text()
  const doc = new JSDOM(html, { url })
  const reader = new Readability(doc.window.document)
  const article = reader.parse()

  return {
    title: article.title,
    lang: article.lang,
    content: article.textContent,
    siteName: article.siteName
  }
})