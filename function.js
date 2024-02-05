import 'dotenv/config'
import { openai } from './openai.js'
import math from 'advanced-calculator'

const QUESTION = process.argv[2] || 'Hi'

const messages = [
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

const getResults = (message) => {
  return openai.chat.completions.create({
    model: 'gpt-3.5-turbo-16k-0613',
    messages,
    temperature: 0,
    functions: [
      {
        name: 'calculate',
        description: 'Run math expression',
        parameters: {
          type: 'object',
          properties: {
            expression: {
              type: 'string',
              description: 'The match expression evaluate like "2*3+(21/2)^2"',
            },
          },
          required: ['expression'],
        },
      },
    ],
  })
}

let response
while (true) {
  response = await getResults(messages)

  if (response.choices[0].finish_reason == 'stop') {
    console.log(response.choices[0].message.content)
    break
  } else if (response.choices[0].finish_reason == 'function_call') {
    const fName = response.choices[0].message.function_call.name
    const args = response.choices[0].message.function_call.arguments

    const functionToCall = functions[fName]
    const params = JSON.parse(args)

    const result = functionToCall(params)

    messages.push({
      role: 'assistant',
      content: null,
      function_call: {
        name: fName,
        arguments: args,
      },
    })

    messages.push({
      role: 'function',
      name: fName,
      content: JSON.stringify({ result: result }),
    })
  }
}
