import OpenAI from 'openai'
import fs from "fs"
import dotenv from 'dotenv'

dotenv.config()

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})
const express = require('express');
const handlecors = require('cors');

const app = express();
const PORT = 5000;

// app.use(cors({
//   origin: "http://localhost:3000/"
// }))

app.listen(PORT, (error) => {
  if (!error)
    console.log("Server is Successfully Running, and App is listening on port " + PORT)
  else
    console.log("Error occurred, server can't start", error);
}
);

const transcription = async () => {
  await client.audio.transcriptions.create(
    {
      file: fs.createReadStream("C:\\Users\\Jahiem\\Downloads\\Saving a Gallery View.mp3"),
      model: "whisper-1",
    }
  )
}
console.log(transcription.text)