import 'dotenv/config'
import { openai } from './openai.js'

// const functions = {
//
// }

function helloWorld(text) {
  let hello = 'Hello World! ' + appString
  return hello
}

const messages = [
  {
    role: 'system',
    content: 'Perform function requests for the user',
  },
  {
    role: 'user',
    content:
      "Hello, I am a user, I would like to get 5 book recommendations with the keyword 'ChatGPT'",
  },
]

async function callChatGptWithFucntions(appString) {
  return await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-16k-0613',
    messages,
    functions: [
      {
        name: 'helloWorld',
        description: 'Prints hello world with string pass to it',
        parameters: {
          type: 'object',
          properties: {
            appString: {
              type: 'string',
              description: 'The string to append to the hello world message',
            },
          },
          required: ['appString'],
        },
      },
    ],
    function_call: 'auto',
  })
}

let response = await callChatGptWithFucntions('Its about time to call')

console.log('Testing - 1')
console.log(response.choices[0])

if (response.choices[0].finish_reason == 'stop') {
  console.log(response.choices[0].message.content)
} else if (response.choices[0].finish_reason == 'function_call') {
  console.log('Testing - 2')
}
