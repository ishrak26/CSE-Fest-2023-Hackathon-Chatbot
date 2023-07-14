import React, { useState, useEffect } from 'react';

import supabase from './config/supabaseClient';

const FileUploadSingle = () => {
    const [selectedFile, setSelectedFile] = useState();
    const [isFilePicked, setIsFilePicked] = useState(false);
    const [gptAnswer, setGptAnswer] = useState('');
    const [preview, setPreview] = useState();

    const changeHandler = (event) => {
        setSelectedFile(event.target.files[0]);
        setIsFilePicked(true);
    };

    const handleSubmission = async () => {
        const formData = new FormData();

        formData.append('File', selectedFile);

        const avatarFile = selectedFile;
        const filepath = 'public/' + selectedFile.name;
        const { data, error } = await supabase.storage
            .from('ocr-files')
            .upload(filepath, avatarFile);

        if (error) {
            console.log(error);
        }

        if (data) {
            console.log(data);
            const response = await fetch(
                'https://hackbottt.onrender.com/upload',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        filepath: filepath,
                        filetype: selectedFile.type,
                    }),
                }
            ).then((response) => response.json());
            console.log(response);
            setGptAnswer(response.reply);
        }
    };

    // create a preview as a side effect, whenever selected file is changed
    useEffect(() => {
        if (!selectedFile || !selectedFile.type.startsWith('image/')) {
            setPreview(undefined);
            return;
        }

        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);

        // free memory when ever this component is unmounted
        return () => URL.revokeObjectURL(objectUrl);
    }, [selectedFile]);

    return (
        <div>
            <input type="file" name="file" onChange={changeHandler} />
            {isFilePicked ? (
                <div>
                    <p>Filename: {selectedFile.name}</p>
                    <p>Filetype: {selectedFile.type}</p>
                    <p>Size in bytes: {selectedFile.size}</p>
                    <p>
                        lastModifiedDate:{' '}
                        {selectedFile.lastModifiedDate.toLocaleDateString()}
                    </p>
                </div>
            ) : (
                <p>Select a file to show details</p>
            )}
            {preview && <img src={preview} alt="preview" />}
            <div>
                <button onClick={handleSubmission}>Submit</button>
            </div>
            <div>{gptAnswer && <p>{gptAnswer}</p>}</div>
        </div>
    );
};

export default FileUploadSingle;
