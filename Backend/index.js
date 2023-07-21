const express = require('express');
const { generatefile } = require('./generatefile');
const { executecpp } = require('./executecpp');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ online: "Compiler" });
});

app.post("/run", async (req, res) => {
  const { language = 'cpp', code, requiresInput, input } = req.body;

  if (code === undefined) {
    return res.status(404).json({ success: false, error: "Empty Code Body!" });
  }

  try {
    const filepath = await generatefile(language, code, requiresInput, input);
    let output;

    if (requiresInput) {
      output = await executecpp(filepath, requiresInput);
    } else {
      output = await executecpp(filepath);
    }

    res.json({ filepath, output });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

app.listen(4500, () => {
  console.log("Server is listening on port 4500!!");
});
