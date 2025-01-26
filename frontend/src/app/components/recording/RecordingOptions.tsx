// src/app/components/recording/RecordingOptions.tsx
'use client'

import { useState, useRef } from 'react'
import { Mic, Upload, FileText, BookOpen } from 'lucide-react'

interface RecordingOptionsProps {
  onProcessingChange?: (isProcessing: boolean) => void
  onNewRecording?: (recording: any) => void
  disabled?: boolean
}

export default function RecordingOptions({ 
  onProcessingChange, 
  onNewRecording,
  disabled 
}: RecordingOptionsProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Function to handle starting/stopping recording
  const handleRecordingToggle = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop()
      setIsRecording(false)
    } else {
      try {
        // Start new recording
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        audioChunksRef.current = []

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data)
        }

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
          setAudioBlob(audioBlob)
          handleProcessing(true)
          handleTranscription(audioBlob)
        }

        mediaRecorderRef.current = mediaRecorder
        mediaRecorder.start()
        setIsRecording(true)
      } catch (error) {
        console.error('Error accessing microphone:', error)
        alert('Could not access microphone. Please check permissions.')
      }
    }
  }

  // Function to handle file uploads
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAudioBlob(file)
      handleProcessing(true)
      handleTranscription(file)
    }
  }

  // Function to handle processing state
  const handleProcessing = (processing: boolean) => {
    setIsProcessing(processing)
    onProcessingChange?.(processing)
  }

  // Function to handle transcription
  const handleTranscription = async (blob: Blob) => {
    try {
      const formData = new FormData()
      formData.append('audio', blob)

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Transcription failed')
      }

      const data = await response.json()
      handleProcessing(false)
      
      if (onNewRecording) {
        onNewRecording({
          id: Date.now().toString(),
          name: `Recording ${Date.now()}`,
          duration: 0, // You would calculate this from the audio
          createdAt: new Date(),
          transcription: data.transcription
        })
      }
    } catch (error) {
      console.error('Transcription error:', error)
      handleProcessing(false)
      alert('Error transcribing audio. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        {/* Record Button */}
        <button
          onClick={handleRecordingToggle}
          disabled={disabled || isProcessing}
          className={`
            flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors
            ${isRecording 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-plum-500 hover:bg-plum-600 text-white'}
            ${(disabled || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <Mic className="w-5 h-5" />
          <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
        </button>

        {/* Upload Button */}
        <label className={`
          flex items-center space-x-2 px-6 py-3 bg-plum-500 hover:bg-plum-600 
          text-white rounded-lg cursor-pointer transition-colors
          ${(disabled || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
          <Upload className="w-5 h-5" />
          <span>Upload Audio</span>
          <input 
            type="file" 
            accept="audio/*"
            className="hidden"
            disabled={disabled || isProcessing}
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-plum-400 mr-3"></div>
          <span className="text-plum-200">Processing audio...</span>
        </div>
      )}
    </div>
  )
}