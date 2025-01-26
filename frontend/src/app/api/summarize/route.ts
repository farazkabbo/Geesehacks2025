// src/app/api/summarize/route.ts
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: Request) {
  try {
    const { text } = await request.json()
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    const prompt = `Please provide a concise summary of the following meeting transcript:\n\n${text}`
    
    const result = await model.generateContent(prompt)
    const summary = result.response.text()

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Summarization error:', error)
    return NextResponse.json(
      { error: 'Error summarizing text' },
      { status: 500 }
    )
  }
}