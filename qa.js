import { openai } from './openai.js'
import { Document } from 'langchain/document'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { CharacterTextSplitter } from 'langchain/text_splitter'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { YoutubeLoader } from 'langchain/document_loaders/web/youtube'

const question = process.argv[2] || 'Hi'
const video = 'https://youtu.be/zR_iuq2evXo?si=cG8rODgRgXOx9_Cn'

const createStore = (docs) =>
  MemoryVectorStore.fromDocuments(docs, new OpenAIEmbeddings())

const docsFromYoutube = (video) => {
  const loader = YoutubeLoader.createFromUrl(video, {
    language: 'en',
    addVideoInfo: true,
  })
  return loader.loadAndSplit(
    new CharacterTextSplitter({
      separator: ' ',
      chunkSize: 2500,
      chunkOverlap: 100,
    })
  )
}

const docsFromPdf = (video) => {
  const loader = new PDFLoader('xbox.pdf')
  return loader.loadAndSplit(
    new CharacterTextSplitter({
      separator: '. ',
      chunkSize: 2500,
      chunkOverlap: 200,
    })
  )
}

const loadStore = async () => {
  const videDocs = await docsFromYoutube(video)
  const pdfDocs = await docsFromPdf()
  return createStore([...videDocs, ...pdfDocs])
}

const query = async () => {
  const store = await loadStore()
  const results = await store.similaritySearch(question, 2)

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    temperature: 0,
    messages: [
      {
        role: 'assistant',
        content:
          'You are a helpful AI assistant. Anwer questions to your best ability.',
      },
      {
        role: 'user',
        content: `Anwers the following question using the provide context. If you don't have context please say need more context.
        Question:${question}
        Context: ${results.map((r) => r.pageContent).join('\n')}
        `,
      },
    ],
  })

  console.log(
    `Answers: Hellooo, ${
      response.choices[0].message.content
    }\n\nSources: ${results.map((r) => r.metadata.source).join(', ')}`
  )
}

query()

// https://llamahub.ai/
//https://github.com/run-llama/llama-hub/tree/2c95b021246b54b0542bf9ed9289828cc9da6654/llama_hub/file/pdf
//https://github.com/run-llama/llama-hub/tree/2c95b021246b54b0542bf9ed9289828cc9da6654/llama_hub/llama_packs/evaluator_benchmarker
