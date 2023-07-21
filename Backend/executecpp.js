const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const outputpath = path.join(__dirname, 'outputs');

if (!fs.existsSync(outputpath)) {
  fs.mkdirSync(outputpath, { recursive: true });
}

const executecpp = (filepath, requiresInput) => {
  const job_id = path.basename(filepath).split(".")[0];
  const outpath = path.join(outputpath, `${job_id}.exe`);

  return new Promise((resolve, reject) => {
    let command = `g++ "${filepath}" -o "${outpath}"`;

    if (requiresInput) {
      const inputFilePath = path.join(__dirname, 'codes', 'input.txt');
      command = `g++ "${filepath}" -o "${outpath}" && "${outpath}" < "${inputFilePath}"`; // Updated command for Windows
    } else {
      command = `${command} && "${outpath}"`; // Updated command for Windows
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stderr });
      } else if (stderr) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
};

module.exports = {
  executecpp,
};
