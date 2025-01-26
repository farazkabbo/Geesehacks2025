'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, BookOpen, X, Check } from 'lucide-react'
import { useAppState } from '@/context/AppStateContext'
import type { RecordingWithMeta } from '@/app/components/recording/types'

// Define the props interface with clear type definition
interface UploadRecordingProps {
  onClose: () => void
}

export default function UploadRecording({ onClose }: UploadRecordingProps) {
  // Initialize our state variables with undefined for optional values
  // This matches TypeScript's handling of optional properties
  const [file, setFile] = useState<File | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)
  const [filename, setFilename] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  
  // State for tracking processing status and results
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [transcription, setTranscription] = useState<string | undefined>(undefined)
  const [summary, setSummary] = useState<string | undefined>(undefined)
  
  // Reference for the hidden file input element
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addRecording } = useAppState()

  // Define supported audio formats for validation
  const supportedTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/wave']

  // Validate uploaded files meet our requirements
  const validateFile = (file: File) => {
    if (!supportedTypes.includes(file.type)) {
      setError('Please upload an audio file (MP3 or WAV)')
      return false
    }
    
    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size should be less than 50MB')
      return false
    }

    return true
  }

  // Handle new file selection from either drop or file input
  const handleFile = (file: File) => {
    setError(undefined)
    setTranscription(undefined)
    setSummary(undefined)
    
    if (validateFile(file)) {
      setFile(file)
      // Extract filename without extension for editing
      const nameWithoutExt = file.name.split('.')[0] || ''
      setFilename(nameWithoutExt)
    }
  }

  // Handle the transcription process
  const handleTranscribe = async () => {
    if (!file) return
    
    try {
      setIsTranscribing(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Transcription failed')
      }

      const data = await response.json()
      setTranscription(data.transcription)
    } catch (err) {
      setError('Failed to transcribe audio')
      console.error('Transcription error:', err)
    } finally {
      setIsTranscribing(false)
    }
  }

  // Handle the summarization process
  const handleSummarize = async () => {
    if (!transcription) return
    
    try {
      setIsSummarizing(true)
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: transcription })
      })

      if (!response.ok) {
        throw new Error('Summarization failed')
      }

      const data = await response.json()
      setSummary(data.summary)
    } catch (err) {
      setError('Failed to generate summary')
      console.error('Summarization error:', err)
    } finally {
      setIsSummarizing(false)
    }
  }

  // Save the recording with all its data
  const handleSave = async () => {
    if (!file || !filename.trim()) return

    try {
      const audioUrl = URL.createObjectURL(file)
      const extension = file.name.split('.').pop() || 'wav'
      const fullTitle = `${filename.trim()}.${extension}`

      // Create new recording with properly typed optional fields
      const newRecording: RecordingWithMeta = {
        id: crypto.randomUUID(),
        title: fullTitle,
        audioBlob: file,
        audioUrl,
        transcription,
        summary,
        createdAt: new Date(),
        type: 'recording',
        method: 'uploaded',
        duration: 0,
        fileSize: file.size
      }

      // Add to application state and local storage
      addRecording(newRecording)
      const savedRecordings = JSON.parse(localStorage.getItem('voiceRecordings') || '[]')
      localStorage.setItem('voiceRecordings', JSON.stringify([newRecording, ...savedRecordings]))

      onClose()
    } catch (err) {
      setError('Failed to save recording')
      console.error('Error saving recording:', err)
    }
  }

  // Handle drag and drop events for file upload
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(e.type === 'dragenter' || e.type === 'dragover')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFile(droppedFile)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999]">
      <div className="bg-[#2D1B2E] rounded-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto border border-plum-800">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-plum-100">
            Upload Recording
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-plum-300 hover:bg-plum-700/30 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drop Zone */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`w-full h-48 border-2 border-dashed rounded-lg
            flex flex-col items-center justify-center gap-2 cursor-pointer
            transition-colors mb-6
            ${isDragging 
              ? 'border-plum-400 bg-plum-500/10' 
              : file 
                ? 'border-green-500 bg-green-500/10'
                : 'border-plum-700 hover:border-plum-500 hover:bg-plum-500/5'
            }`}
        >
          {file ? (
            <>
              <Check className="w-8 h-8 text-green-500" />
              <p className="text-sm text-plum-200">{file.name}</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-plum-400" />
              <p className="text-sm text-plum-200">
                Drag & drop your audio file here or <span className="text-plum-400">browse</span>
              </p>
              <p className="text-xs text-plum-300">Supports MP3, WAV (up to 50MB)</p>
            </>
          )}
        </div>

        {/* Filename Input */}
        {file && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-plum-200 mb-2">
              Recording Name
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="flex-grow px-3 py-2 bg-[#1D1321] border border-plum-700 rounded-lg 
                         text-plum-100 focus:outline-none focus:ring-2 focus:ring-plum-500"
                placeholder="Enter recording name"
              />
              <span className="text-plum-300 text-sm">{`.${file.name.split('.').pop()}`}</span>
            </div>
          </div>
        )}

        {/* Processing Actions */}
        {file && (
          <div className="space-y-4 mb-6">
            {/* Transcription Section */}
            <div className="space-y-2">
              <button
                onClick={handleTranscribe}
                disabled={isTranscribing || !file}
                className="w-full px-4 py-3 bg-plum-500 text-white rounded-lg 
                         hover:bg-plum-600 transition-colors flex items-center justify-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="w-5 h-5" />
                {isTranscribing ? 'Transcribing...' : 'Transcribe Audio'}
              </button>
              
              {transcription && (
                <div className="p-3 bg-[#1D1321] rounded-lg border border-plum-700">
                  <p className="text-sm text-plum-200 line-clamp-3">{transcription}</p>
                </div>
              )}
            </div>

            {/* Summarization Section */}
            {transcription && (
              <div className="space-y-2">
                <button
                  onClick={handleSummarize}
                  disabled={isSummarizing || !transcription}
                  className="w-full px-4 py-3 bg-plum-500 text-white rounded-lg 
                           hover:bg-plum-600 transition-colors flex items-center justify-center gap-2
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <BookOpen className="w-5 h-5" />
                  {isSummarizing ? 'Summarizing...' : 'Generate Summary'}
                </button>

                {summary && (
                  <div className="p-3 bg-[#1D1321] rounded-lg border border-plum-700">
                    <p className="text-sm text-plum-200 line-clamp-3">{summary}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-500 mb-4">{error}</p>
        )}

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          accept="audio/*"
          className="hidden"
        />

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-plum-300 hover:bg-plum-700/30 rounded-lg transition-colors"
          >
            Cancel
          </button>
          {file && (
            <button
              onClick={handleSave}
              disabled={!filename.trim()}
              className="px-4 py-2 bg-plum-500 text-white rounded-lg hover:bg-plum-600 
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Recording
            </button>
          )}
        </div>
      </div>
    </div>
  )
}