import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';

import { Configuration, OpenAIApi } from 'openai';
config();

const port = 8000;
const app = express();
app.use(express.json());
app.use(cors());

const openAi = new OpenAIApi(
    new Configuration({
        apiKey: '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',
    })
);

async function askGPT(question) {
    // console.log('here');
    // console.log(process.env.OPEN_AI_API_KEY);
    const response = await openAi.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: question }],
    });
    // console.log('there');
    return response.data.choices[0].message.content;
}

app.post('/input', async function (req, res) {
    // console.log(req.body)
    const name = req.body.name;
    const question = req.body.question;

    // console.log(typeof question);

    console.log(name + ' ' + question);

    try {
        const response = await askGPT(question);
        console.log(response);
        res.send({
            reply: response,
        });
    } catch (error) {
        console.log('erorr is ' + error);
    }

    // answer = response.data.choices[0].message.content;

    // res.json(answer);
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
