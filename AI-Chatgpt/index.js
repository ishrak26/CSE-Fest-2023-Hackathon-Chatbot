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

    if (req.body.filetype === 'text/plain') {
        console.log('this is a text file');
        // text file
        // using the readFileSync() function
        // and passing the path to the file
        const buffer = fs.readFileSync(data.publicUrl);

        // use the toString() method to convert
        // Buffer into String
        const fileContent = buffer.toString();

        console.log(fileContent);
    } else {
        await Tesseract.recognize(data.publicUrl, 'eng', {
            logger: (m) => console.log(m),
        }).then(({ data: { text } }) => {
            console.log(text);
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

    res.send({
        reply: 'OK',
    });
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
