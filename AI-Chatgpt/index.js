// libraries
const express = require('express');
const cors = require('cors');

// configuring .env variables
require('dotenv').config();

const { Configuration, OpenAIApi } = require('openai');
// config();

const port = process.env.PORT || 8000;
const app = express();
app.use(cors());
app.use(express.json());

const Tesseract = require('tesseract.js');

const supabase = require('./config/supabaseClient');

// get filesystem module
const axios = require('axios');

const { promises } = require('fs');

// get filesystem module

const openAi = new OpenAIApi(
    new Configuration({
        apiKey: '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',
    })
);

var context = [];

//DOLL-E
async function generateImage(prompt) {
    console.log(prompt);

    const response = await openAi.createImage({
        prompt: `${prompt.slice(
            0,
            100
        )}. No text, genderless, children's book illustration`,
        n: 1,
        size: '256x256',
    });
    //console.log(response.data.choices[0].message.content)
    return response.data.data[0].url;
}

async function askGPT() {
    // console.log('here');
    // console.log(process.env.OPEN_AI_API_KEY);

    const response = await openAi.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: context,
    });
    // console.log('there');
    return response.data.choices[0].message.content;
}

const MAX_QUESTIONS = 10;

app.post('/input', async function (req, res) {
    // const genImg = await generateImage('abc');
    // console.log(genImg);

    // console.log(req.body)
    const name = req.body.name;
    const question = req.body.question;

    // console.log(process.env.OPEN_AI_API_KEY);
    // console.log(typeof process.env.OPEN_AI_API_KEY);

    // console.log(typeof question);

    console.log(name + ' ' + question);

    try {
        if (context.length == MAX_QUESTIONS) context.shift();
        context.push({ role: 'user', content: question });

        const response = await askGPT();
        console.log(response);

        const paragraphs = response.split('\n');
        console.log(paragraphs);

        paragraphs.forEach(async function (paragraph, index) {
            if (paragraph) {
                const imageUrl = await generateImage(paragraph);
                console.log(imageUrl);
                // await downloadImage(imageUrl, `./test${index}.png`);
            }
        });

        if (context.length == MAX_QUESTIONS) context.shift();
        context.push({
            role: 'assistant',
            content: response,
        });
        res.send({
            reply: response,
        });
    } catch (error) {
        console.log('erorr is ' + error);
    }

    // answer = response.data.choices[0].message.content;

    // res.json(answer);
});

async function readTextFile(absoluteUrl) {
    try {
        const response = await axios.get(absoluteUrl);
        const fileContents = response.data;
        console.log('File contents:', fileContents);
        return fileContents;
    } catch (error) {
        console.error('Error reading file:', error.message);
        return null;
    }
}

app.post('/upload', async function (req, res) {
    const filepath = req.body.filepath;
    // Use the JS library to download a file.

    const { data } = supabase.storage.from('ocr-files').getPublicUrl(filepath);

    console.log(data);

    let fileContent;

    if (req.body.filetype === 'text/plain') {
        // console.log('this is a text file');
        fileContent = await readTextFile(data.publicUrl);
    } else {
        await Tesseract.recognize(data.publicUrl, 'eng', {
            logger: (m) => console.log(m),
        }).then(({ data: { text } }) => {
            console.log(text);
            fileContent = text;
        });
    }

    const { data2, error } = await supabase.storage
        .from('ocr-files')
        .remove([filepath]);

    // console.log('data2 is ' + data2);

    if (error) {
        console.log(error);
    }

    if (data2) {
        console.log(data2);
    }

    const response = await askGPT(fileContent);
    console.log(response);

    res.send({
        reply: response,
    });
});

const downloadImage = async (url, path) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await promises.writeFile(path, buffer);
};

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
