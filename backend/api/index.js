import express from 'express';
import fs from 'fs';
import dotenv from 'dotenv';
import OpenAI from 'openai'

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const PORT = 5000;

app.listen(PORT, (error) => {
  if (!error)
    console.log("Server is Successfully Running, and App is listening on port " + PORT);
  else
    console.log("Error occurred, server can't start", error);
});

const transcription = async () => {
  const response = await client.audio.transcriptions.create({
    file: fs.createReadStream("C:\\Users\\Jahiem\\Downloads\\Saving a Gallery View.mp3"),
    model: "whisper-1",
  });
  console.log(response.text);
};
transcription();
