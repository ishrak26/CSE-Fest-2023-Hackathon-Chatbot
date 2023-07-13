import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';

import { Configuration, OpenAIApi } from 'openai';
config();

const port = 8000;
const app = express();
app.use(express.json());
app.use(cors());

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL,
    process.env.REACT_APP_ANON_KEY
);

const openAi = new OpenAIApi(
    new Configuration({
        apiKey: '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',
    })
);

async function askGPT(question) {
    // console.log('here');
    console.log(process.env.OPEN_AI_API_KEY);
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

    console.log(process.env.OPEN_AI_API_KEY);
    console.log(typeof process.env.OPEN_AI_API_KEY);

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

app.post('/upload', async function (req, res) {
    const filepath = req.body.filepath;
    // Use the JS library to download a file.

    const { data } = supabase.storage.from('ocr-files').getPublicUrl(filepath);

    console.log(data);
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
