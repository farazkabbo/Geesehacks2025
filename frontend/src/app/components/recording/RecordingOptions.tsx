
'use client'

import { useState } from 'react'
import { Mic, Upload, FileText, BookOpen } from 'lucide-react'

export default function RecordingOptions() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [transcription, setTranscription] = useState('')
  const [summary, setSummary] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Handle audio recording
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const audioChunks: BlobPart[] = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        setAudioBlob(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Stop recording after 2 hours (or adjust as needed)
      setTimeout(() => mediaRecorder.stop(), 7200000)
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  // Handle transcription
  const handleTranscribe = async () => {
    if (!audioBlob) return

    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob)

      // Replace with your actual API endpoint
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      setTranscription(data.transcription)
    } catch (error) {
      console.error('Error transcribing audio:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle summarization
  const handleSummarize = async () => {
    if (!transcription) return

    setIsProcessing(true)
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: transcription })
      })

      const data = await response.json()
      setSummary(data.summary)
    } catch (error) {
      console.error('Error summarizing transcription:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="mb-8 bg-[#2D1B2E] rounded-lg p-6 border border-plum-800">
      <div className="flex flex-wrap gap-4">
        {/* Record Button */}
        <button
          onClick={isRecording ? () => setIsRecording(false) : handleStartRecording}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors
            ${isRecording 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-plum-500 hover:bg-plum-600 text-white'}
          `}
        >
          <Mic className="w-5 h-5" />
          <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
        </button>

        {/* Upload Button */}
        <label className="flex items-center space-x-2 px-4 py-2 bg-plum-500 hover:bg-plum-600 text-white rounded-lg cursor-pointer transition-colors">
          <Upload className="w-5 h-5" />
          <span>Upload Audio</span>
          <input 
            type="file" 
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                setAudioBlob(file)
              }
            }}
          />
        </label>

        {/* Transcribe Button */}
        <button
          onClick={handleTranscribe}
          disabled={!audioBlob || isProcessing}
          className="flex items-center space-x-2 px-4 py-2 bg-plum-500 hover:bg-plum-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="w-5 h-5" />
          <span>Transcribe</span>
        </button>

        {/* Summarize Button */}
        <button
          onClick={handleSummarize}
          disabled={!transcription || isProcessing}
          className="flex items-center space-x-2 px-4 py-2 bg-plum-500 hover:bg-plum-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <BookOpen className="w-5 h-5" />
          <span>Summarize</span>
        </button>
      </div>

      {/* Display Areas */}
      {transcription && (
        <div className="mt-6 p-4 bg-[#1D1321] rounded-lg border border-plum-800">
          <h3 className="text-lg font-semibold text-plum-100 mb-2">Transcription</h3>
          <p className="text-plum-200">{transcription}</p>
        </div>
      )}

      {summary && (
        <div className="mt-6 p-4 bg-[#1D1321] rounded-lg border border-plum-800">
          <h3 className="text-lg font-semibold text-plum-100 mb-2">Summary</h3>
          <p className="text-plum-200">{summary}</p>
        </div>
      )}
    </div>
  )
}