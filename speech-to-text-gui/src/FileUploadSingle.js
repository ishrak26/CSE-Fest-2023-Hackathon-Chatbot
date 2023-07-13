import React, { useState } from 'react';

import supabase from './config/supabaseClient';

const FileUploadSingle = () => {
    const [selectedFile, setSelectedFile] = useState();
    const [isFilePicked, setIsFilePicked] = useState(false);

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
            await fetch('http://localhost:8000/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filepath: filepath,
                    filetype: selectedFile.type,
                }),
            });
        }
    };

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
            <div>
                <button onClick={handleSubmission}>Submit</button>
            </div>
        </div>
    );
};

export default FileUploadSingle;
