import 'dotenv/config'
import { openai } from './openai'
import math from 'advanced-calculator'

const QUESTION = process.argv[2] || 'Hi'

const message = [
  {
    role: 'user',
    content: QUESTION,
  },
]

const functions = {
  calculate({ expression }) {
    return math.evaluate(expression)
  },
}
