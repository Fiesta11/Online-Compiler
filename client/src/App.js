import './App.css';
import React, { useState, useEffect } from "react";
import AceEditor from "react-ace";
import stubs from './defaultstubs';
import axios from 'axios';
import moment from 'moment';
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-dracula";

function App() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState("cpp");
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('');
  const [jobId, setJobId] = useState('');
  const [jobDetails , setJobDetails] = useState(null);

  useEffect(() => {
    const defaultlang = localStorage.getItem("default-language") || "cpp";
    setLanguage(defaultlang);
  }, []);

  useEffect(() => {
    setCode(stubs[language]);
  }, [language]);

  const setdefaultlanguage = () => {
    localStorage.setItem("default-language", language);
    console.log(`${language} set as the default language`);
  }

  const renderTimeDetails = () => {
    if (!jobDetails) {
      return "";
    }

    let result = '';
    let { submittedAt, completedAt, startedAt } = jobDetails;
    submittedAt = moment(submittedAt).toString();
    result += `Submitted at : ${submittedAt}`;

    if (!completedAt || !startedAt) {
      return result;
    }

    const start = moment(startedAt);
    const end = moment(completedAt);
    const exec_time = end.diff(start, 'seconds', true);

    result += ` Execution Time : ${exec_time}s`;
    return result;
  }

  const handlesubmit = async () => {
    const payload = {
      language,
      code
    };

    try {
      setJobId("");
      setStatus("");
      setOutput("");
      setJobDetails(null);

      const { data } = await axios.post("http://localhost:5000/run", payload);
      setJobId(data.jobId);
      let interval_id;

      interval_id = setInterval(async () => {
        const { data: dataRes } = await axios.get("http://localhost:5000/status", { params: { id: data.jobId } });
        const { success, job, error } = dataRes;

        if (success) {
          const { status: jobStatus, output: jobOutput } = job;
          setStatus(jobStatus);
          setJobDetails(job);
          if (jobStatus === "pending") {
            return;
          }
          setOutput(jobOutput);
          clearInterval(interval_id);
        } else {
          setStatus("Error");
          console.error(error);
          setOutput(error);
          clearInterval(interval_id);
        }
      }, 1000);

    } catch ({ response }) {
      if (response) {
        const errMsg = response.data.error.stderr;
        setOutput(errMsg);
      } else {
        setOutput("Error Connecting to the server!!");
      }
    }
  }

  return (
    <>
      <div className="App">
        <h1>Online Code Compiler</h1>
        <div>
          <label>Language : </label>
          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
            }}
          >
            <option value="cpp">C++</option>
            <option value="py">Python</option>
          </select>
        </div>
        <br />
        <div>
          <button onClick={setdefaultlanguage}>Set Default</button>
        </div>
        <br />
        <AceEditor
          mode={language === "cpp" ? "c_cpp" : "python"}
          theme="dracula" // Replace this with your desired dark theme
          fontSize={14}
          value={code}
          onChange={(value) => setCode(value)}
          name="code-editor"
          width="100%"
          height="400px"
          editorProps={{ $blockScrolling: true }}
        />
        <br />
        <button onClick={handlesubmit}> Submit</button>
        <p>{status}</p>
        <p>{jobId && `JobID : ${jobId}`}</p>
        <p>{renderTimeDetails()}</p>
        <p>{output}</p>
      </div>
    </>
  );
}

export default App;
