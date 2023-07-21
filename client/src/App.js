// App.js
import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import axios from 'axios';

function App() {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [requiresInput, setRequiresInput] = useState(false);
  const [inputData, setInputData] = useState('');

  console.log(code);

  const handlesubmit = async () => {
    const payload = {
      language: 'cpp',
      code,
      requiresInput,
      input: requiresInput ? inputData : '',
    };

    try {
      const { data } = await axios.post('http://localhost:4500/run', payload);
      console.log(data);
      setOutput(data.output);
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <>
      <div className="container">
        <h1>Online Compiler</h1>
        <div className="input-output-container">
          <div className="code-area">
            <textarea
              rows="20"
              cols="75"
              className="textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter your C++ code here..." spellCheck = "false"
            ></textarea>
            <div className="label-container">
              <input
                type="checkbox"
                checked={requiresInput}
                onChange={() => setRequiresInput((prev) => !prev)}
              />
              <label>Requires Input</label>
            </div>
            {requiresInput && (
              <div className="input-container">
                <textarea
                  rows="5"
                  cols="75"
                  placeholder="Enter input data..."
                  className="input-data-textarea"
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                ></textarea>
              </div>
            )}
            <div className="button-container">
              <button onClick={handlesubmit}>Submit</button>
            </div>
          </div>
          <div className="output-area">
            {output && (
              <div className="outputbox">
                <textarea
                  rows="20"
                  cols="40"
                  className="output-textarea"
                  value={output}
                  readOnly
                ></textarea>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
