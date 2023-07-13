import express from "express"
import cors from 'cors'
import {config} from "dotenv"

import { Configuration, OpenAIApi } from "openai"
import readline from "readline"
config()

const port = 8000
const app = express()
app.use(express.json())
app.use(cors())


const openAi = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPEN_AI_API_KEY,
  })
)

app.post('/input', async function (req,res){
    console.log(req.body)
    const name = req.body.name
    const question = req.body.question

    console.log(name+" "+question)

    const response = await openAi.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: question}],
    })

    answer = response.data.choices[0].message.content

    res.json(answer)
})

app.listen(port,()=>{
    console.log(`Server is listening on port ${port}`)
})