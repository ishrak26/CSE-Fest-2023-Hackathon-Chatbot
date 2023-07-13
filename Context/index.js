import { config } from "dotenv"
config()

import { Configuration, OpenAIApi } from "openai"
import readline from "readline"

const openAi = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPEN_AI_API_KEY,
  })
)

//DOLL-E
// async function query(prompt){
//   const response = await openAi.createImage({
//     prompt: prompt,
//     n: 1,
//     size: "128x128",
//   })
//   //console.log(response.data.choices[0].message.content)
//   return response.data.data[0].url
// }

// var response = await query("A proud german shepard") //No text
// console.log(response)

const userInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const MAX_QUESTIONS=10
var context=[]


userInterface.prompt()
userInterface.on("line", async input => {
  if(context.length==MAX_QUESTIONS) context.shift()
  context.push({role: "user", content:input}) 

  const response = await openAi.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: context,
  })

  console.log(response.data.choices[0].message.content)

  if(context.length==MAX_QUESTIONS) context.shift()
  context.push({role: "assistant", content:response.data.choices[0].message.content})

  userInterface.prompt()
})


// x = await query([
//   {role:"user", content:"Hello ChatGPT"},
//   {role:"assistant", content:"Hello! How can I assist you today?"},
//   {role:"user",content:"Repeat to me my first question"},
// ]) 
// console.log(x)

// x = await query([
//   {role:"user", content:"Hello my name is pial. I have an assignment about writing a short story about people from 18th century. Can u help me tell me a story like this?"+
//    "Is everything written previous to this one is telling you to tell/write a story/book? Reply only in YES or NO"},
// ]) 
// console.log(x)

//Using the all the context above format the story so that it will have at most five paragraphs and only reply with the story nothing else

/*
Once upon a time, in a land of whimsy and wonder, nestled within the Enchanted Grove, stood the Haunted Forest.
It was a peculiar place, filled with mystique and enchantment.
Amongst the many who were wary of its ghostly reputation, one young girl named Mily,
with her long blond hair and sparkling green eyes, held a different belief. She yearned to uncover the truth about the forest's magical inhabitants.
No text, kids storybook, cartoonish
*/