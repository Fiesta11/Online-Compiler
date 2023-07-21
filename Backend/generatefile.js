const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');
const dircodes = path.join(__dirname, 'codes');

if (!fs.existsSync(dircodes)) {
  fs.mkdirSync(dircodes, { recursive: true });
}

const generatefile = async (format, content, requiresInput, input) => {
  const jobid = uuid();
  const filename = `${jobid}.${format}`;
  const filepath = path.join(dircodes, filename);

  await fs.writeFileSync(filepath, content);

  if (requiresInput && input) {
    const inputFilePath = path.join(dircodes, 'input.txt');
    await fs.writeFileSync(inputFilePath, input);
  } else if (!requiresInput) {
    // If input is not required, remove the "input.txt" file if it exists
    const inputFilePath = path.join(dircodes, 'input.txt');
    if (fs.existsSync(inputFilePath)) {
      fs.unlinkSync(inputFilePath);
    }
  }

  return filepath;
};

module.exports = {
  generatefile,
};
