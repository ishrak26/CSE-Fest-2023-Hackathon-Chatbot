import React, { useState, useEffect } from 'react';

const TextToSpeech = ({ text }) => {
    const [needPlay, setNeedPlay] = useState(true);
    const [needPause, setNeedPause] = useState(false);
    const [needStop, setNeedStop] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const [utterance, setUtterance] = useState(null);

    useEffect(() => {
        const synth = window.speechSynthesis;
        const u = new SpeechSynthesisUtterance(text);

        setUtterance(u);

        return () => {
            synth.cancel();
        };
    }, [text]);

    const handlePlay = () => {
        const synth = window.speechSynthesis;

        if (isPaused) {
            synth.resume();
        }

        synth.speak(utterance);

        setIsPaused(false);

        setNeedStop(true);
        setNeedPlay(false);
        setNeedPause(true);
    };

    const handlePause = () => {
        const synth = window.speechSynthesis;

        synth.pause();

        setIsPaused(true);

        setNeedPause(false);
        setNeedStop(true);
        setNeedPlay(true);
    };

    const handleStop = () => {
        const synth = window.speechSynthesis;

        synth.cancel();

        setIsPaused(false);

        setNeedPause(false);
        setNeedStop(false);
        setNeedPlay(true);
    };

    return (
        <div>
            {needPlay && (
                <button>
                    <i className="material-icons" onClick={handlePlay}>
                        play_arrow
                    </i>
                </button>
            )}
            {needPause && (
                <button>
                    <i className="material-icons" onClick={handlePause}>
                        pause
                    </i>
                </button>
            )}
            {needStop && (
                <button>
                    <i className="material-icons" onClick={handleStop}>
                        stop
                    </i>
                </button>
            )}
        </div>
    );
};

export default TextToSpeech;
