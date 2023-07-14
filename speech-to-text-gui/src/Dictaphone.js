import React, { useState } from 'react';
import SpeechRecognition, {
    useSpeechRecognition,
} from 'react-speech-recognition';

import TextToSpeech from './TextToSpeech';

const Dictaphone = () => {
    const [gptAnswer, setGptAnswer] = useState('');
    const [question, setQuestion] = useState('');
    const [pdfurl, setPDFUrl] = useState('');

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition,
    } = useSpeechRecognition();

    if (!browserSupportsSpeechRecognition) {
        return <span>Browser doesn't support speech recognition.</span>;
    }

    const onSubmitForm = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8000/input', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: 'pial',
                    question: transcript,
                }),
            }).then((response) => response.json());
            console.log(response);
            setGptAnswer(response.reply);
            setPDFUrl(response.url);
            // console.log('gptAnswer is ' + gptAnswer);

            // window.location = '/'; // refreshes the form input
        } catch (error) {
            console.error(error.message);
        }
    };

    const onSubmitTextForm = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8000/input', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: 'pial',
                    question: question,
                }),
            }).then((response) => response.json());
            console.log(response);
            setGptAnswer(response.reply);
            setPDFUrl(response.url);
            // console.log('gptAnswer is ' + gptAnswer);

            // window.location = '/'; // refreshes the form input
        } catch (error) {
            console.error(error.message);
        }
    };

    return (
        <div>
            <div>
                <form className="d-flex mt-5" onSubmit={onSubmitTextForm}>
                    <input
                        type="text"
                        className="form-control"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                    />
                    <button className="btn btn-success">Ask</button>
                </form>
            </div>
            <div>
                <p>Microphone: {listening ? 'on' : 'off'}</p>
                <button onClick={SpeechRecognition.startListening}>
                    Start
                </button>
                <button onClick={SpeechRecognition.stopListening}>Stop</button>
                <button onClick={resetTranscript}>Reset</button>
                <p>{transcript}</p>
            </div>

            <div>
                <form className="d-flex mt-5" onSubmit={onSubmitForm}>
                    <button className="btn btn-success">Test</button>
                </form>
            </div>
            <div>{gptAnswer && <TextToSpeech text={gptAnswer} />}</div>
            <div>{gptAnswer && <p>{gptAnswer}</p>}</div>
            <div>{pdfurl && <p>{pdfurl}</p>}</div>
        </div>
    );
};
export default Dictaphone;
