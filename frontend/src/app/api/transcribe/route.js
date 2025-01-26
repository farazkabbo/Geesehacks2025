import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
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

    // Create a File object for OpenAI
    const file = await OpenAI.toFile(
      fs.createReadStream(tempFilePath),
      'audio.wav'
    );

    // Transcribe using OpenAI's Whisper API
    console.log('Starting transcription...');
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en',
      response_format: 'json'
    });
    console.log('Transcription completed');

    // Save the file to public uploads
    await fs.promises.writeFile(outputFilePath, buffer);

    // Clean up temp file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      await fs.promises.unlink(tempFilePath);
    }

    return NextResponse.json({
      transcription: transcription.text,
      fileUrl: `/uploads/${outputFileName}`
    });

  } catch (error) {
    console.error('Transcription error:', error);

    // Clean up temp file if it exists
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        await fs.promises.unlink(tempFilePath);
      } catch (cleanupError) {
        console.error('Error cleaning up temp file:', cleanupError);
      }
    }

    // Determine specific error message and status code
    let errorMessage = 'Failed to transcribe audio';
    let statusCode = 500;

    if (error.message.includes('API key')) {
      errorMessage = 'OpenAI API key configuration error';
      statusCode = 500;
    } else if (error.message.includes('file too large')) {
      errorMessage = 'Audio file is too large (max 25MB)';
      statusCode = 413;
    } else if (error.message.includes('Invalid file')) {
      errorMessage = 'Invalid audio file format';
      statusCode = 400;
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: statusCode }
    );
  }
}

// Configure the API route
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};