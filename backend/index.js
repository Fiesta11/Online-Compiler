const express = require("express")
const cors = require('cors')
const mongoose = require('mongoose')


const {generateFile} = require("./generatefile")
const {add_job_to_queue} = require("./jobqueue")
const Job  = require("./models/job");

mongoose.connect('mongodb://127.0.0.1/compiler_db')
.then(() => console.log('Connection is Successful'))
.catch(err => console.error('Couldnt connect to mongodb' , err))


const app = express()
app.use(express.urlencoded({extended : true}))
app.use(express.json())
app.use(cors());


app.get("/status" , async(req ,res) =>{
  const jobId = req.query.id;
  console.log("Requested", jobId);
  if(jobId == undefined)
  {
    return res.status(400).json({success : false , error : "Missing Id query param"})
  }
  try{
  const job = await Job.findById(jobId);
   
    if(job === undefined)
    {
      return res.status(404).json({success : false , error : "Invalid Job Id"});
    }

    return res.status(200).json({success : true , job});

  }catch(err){
    return res.status(400).json({success : false , error : JSON.stringify(err)})
  }


})

app.post("/run" , async(req , res) =>{
    // const language = req.body.language;
    // const code = req.body.code;

    
    const {language = "cpp" , code} = req.body;
    // console.log(language, code.length);
    if(code === undefined)
    {
        return res.status(400).json({success : false , error : "Empty Code Body"})
    }
    let job;
  try{
      // need to generate a c++ file with content from its request
      const filepath = await generateFile(language , code);

       job = await new Job({language , filepath}).save();
      const jobId = job._id
      add_job_to_queue(jobId);

      res.status(201).json({ success: true, jobId });
  }catch(err){
      return res.status(500).json({success : false , err : JSON.stringify(err) })
  }
})

app.listen(5000 , () => {
    console.log("Listening on port 5000");
})
