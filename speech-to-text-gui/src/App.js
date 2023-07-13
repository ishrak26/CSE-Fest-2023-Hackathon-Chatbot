import './App.css';

import Dictaphone from './Dictaphone';
import FileUploadSingle from './FileUploadSingle';

function App() {
    return (
        <div className="App">
            <Dictaphone />
            <div>
                <FileUploadSingle />
            </div>
        </div>
    );
}

export default App;
