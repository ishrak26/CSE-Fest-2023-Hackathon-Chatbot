// libraries
const express = require('express');
const cors = require('cors');

const pdfKit = require('pdfkit');
const fs = require('fs');

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

const pdfGen = require('./pdf_handler/pdfGen');
const EasyDl = require('easydl');

// get filesystem module

const openAi = new OpenAIApi(
    new Configuration({
        apiKey: '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',
    })
);

var context = [];
let pdfDoc;
let mx;

//DOLL-E
async function generateImage(prompt) {
    console.log('$$$$$: ' + prompt);

    const response = await openAi.createImage({
        prompt: `${prompt.slice(
            0,
            100
        )}. No text, genderless, children's book illustration`,
        n: 1,
        size: '256x256',
    });
    //console.log(response.data.choices[0].message.content)
    console.log('$$$$$: ' + response.data.data[0].url);
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

    // pdfGen();

    try {
        if (
            (question.includes('write') || question.includes('tell')) &&
            question.includes('story')
        ) {
            context = []; // clear array
        }

        while (context.length > MAX_QUESTIONS) context.shift();
        context.push({ role: 'user', content: question });

        if (question.includes('pdf')) {
            context.pop();
            // generate pdf

            // Using all the context from before write me the full story and format it to have at most five paragraphs and only reply with the story and nothing else.
            // For the last message which was a story give me an appropiate title. Reply with only the title and nothing else.

            let prompt =
                'Using all the context from before write the intended story and format it to have at most four paragraphs and only reply with the story and nothing else.';
            while (context.length > MAX_QUESTIONS) context.shift();
            context.push({ role: 'user', content: prompt });

            const reply = await askGPT();
            context.push({ role: 'assistant', content: prompt });
            //console.log(reply);

            const whole = reply;
            const paragraphs = reply.split('\n');
            //console.log(paragraphs);

            prompt =
                'For the last message which was a story give me an appropiate title. Reply with only the title and nothing else.';
            context.push({ role: 'user', content: prompt });
            const title = await askGPT();

            console.log('Title:' + title);
            console.log(paragraphs);

            paragraphs.forEach((paragraph, index) => {
                console.log(
                    'PARAGRAPH: ' + paragraph.length + '   ' + paragraph
                );
                if (paragraph.length > 0) {
                    mx = index;
                }
            });

            let fontNormal = 'Helvetica';
            let fontBold = 'Helvetica-Bold';
            pdfDoc = new pdfKit();
            let fileName = 'sample.pdf';
            let stream = fs.createWriteStream(fileName);
            pdfDoc.pipe(stream);

            pdfDoc
                .font(fontBold)
                .text(title, { continued: true, align: 'center' });
            pdfDoc.font(fontNormal);
            pdfDoc.text('\n\n\n');
            pdfDoc.addPage();

            //await downloadImages(paragraphs);
            //pdfGen(paragraphs, title);

            const imageUrl = await generateImage(whole);
            console.log(imageUrl);
            //await downloadImage(imageUrl, `./test0.png`);

            const completed = await new EasyDl(imageUrl, 'test0.png', {
                connections: 1,
                maxRetry: 5,
            }).wait();

            pdfDoc.addPage();
            pdfDoc.text(whole + '\n\n\n');
            pdfDoc.image(`test0.png`, {
                width: 150,
                height: 150,
                align: 'center',
            });
            pdfDoc.text('\n\n\n');

            pdfDoc.end();
            console.log('pdf generate successfully');

            //await downloadImages(paragraphs).then(pdfGen(paragraphs, title));
            //console.log(await generateImage('Hello World'));
            res.send({
                reply: 'pdf done',
            });
        } else {
            const response = await askGPT();
            console.log(response);

            while (context.length > MAX_QUESTIONS) context.shift();
            context.push({
                role: 'assistant',
                content: response,
            });
            res.send({
                reply: response,
            });
        }
    } catch (error) {
        console.log('erorr is ' + error);
    }

    // answer = response.data.choices[0].message.content;

    // res.json(answer);
});

async function downloadImages(paragraphs) {
    paragraphs.forEach(async function (paragraph, index) {
        if (paragraph.length > 0) {
            const imageUrl = await generateImage(paragraph);
            console.log(paragraph + '===' + imageUrl);
            await downloadImage(imageUrl, `./test${index}.png`);

            pdfDoc.addPage();
            pdfDoc.text(paragraph + '\n\n\n');
            pdfDoc.image(`test${index}.png`, {
                width: 150,
                height: 150,
                align: 'center',
            });
            pdfDoc.text('\n\n\n');

            if (mx == index) {
                pdfDoc.end();
                console.log('pdf generate successfully');
            }
        }
    });
}

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

app.get('/', async function (req, res) {
    res.send({
        hello: 'hello',
    });
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
