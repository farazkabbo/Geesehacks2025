import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize AWS S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configure route behavior
export const maxDuration = 300; // 5 minutes timeout
export const dynamic = 'force-dynamic';

export async function POST(req) {
  let tempFilePath = null;

  try {
    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const formData = await req.formData();
    const audioFile = formData.get('file');

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Log file information for debugging
    console.log('File type:', audioFile.type);
    
    // Convert the audio file to a Buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log('File size:', buffer.length);

    // Create necessary directories
    const tempDir = path.join(process.cwd(), 'tmp');
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    await fs.promises.mkdir(tempDir, { recursive: true });
    await fs.promises.mkdir(uploadDir, { recursive: true });

    // Generate unique filenames
    const timestamp = Date.now();
    tempFilePath = path.join(tempDir, `temp-${timestamp}.wav`);
    const outputFileName = `recording-${timestamp}.wav`;
    const outputFilePath = path.join(uploadDir, outputFileName);

    // Write the temp file
    await fs.promises.writeFile(tempFilePath, buffer);

    // Upload to S3
    const s3Params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `uploads/${outputFileName}`,
      Body: buffer,
      ContentType: audioFile.type,
    };

    const s3Upload = await s3Client.send(new PutObjectCommand(s3Params));
    const s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/uploads/${outputFileName}`;
    console.log('File uploaded to S3:', s3Url);

    // Create a File object for OpenAI
    const file = await OpenAI.toFile(
      fs.createReadStream(tempFilePath),
      'audio.wav'
    );

    // Transcribe using OpenAI's Whisper API
    const response = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
    });

    // Clean up temp file
    await fs.promises.unlink(tempFilePath);

    // Save the transcribed text to a file
    await fs.promises.writeFile(outputFilePath, response.text);

    return NextResponse.json({ transcription: response.text, filePath: outputFilePath, s3Url });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
  }
}