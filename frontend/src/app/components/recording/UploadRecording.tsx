'use client'

import { useState, useRef } from 'react'
import { useAppState } from '@/context/AppStateContext'
import type { RecordingWithMeta } from '@/app/components/recording/types'

interface UploadRecordingProps {
  onClose: () => void
}

export default function UploadRecording({ onClose }: UploadRecordingProps) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filename, setFilename] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addRecording } = useAppState()

  const supportedTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/wave']

  const validateFile = (file: File) => {
    if (!supportedTypes.includes(file.type)) {
      setError('Please upload an audio file (MP3 or WAV)')
      return false
    }
    
    if (file.size > 50 * 1024 * 1024) {
      setError('File size should be less than 50MB')
      return false
    }

    return true
  }

  const handleFile = (file: File) => {
    setError(null)
    
    if (validateFile(file)) {
      setFile(file)
      // Remove extension when setting filename for edit
      const nameWithoutExt = file.name.split('.')[0] || ''
      setFilename(nameWithoutExt)
    }
  }

  const handleSave = async () => {
    if (!file || !filename.trim()) return

    try {
      const audioUrl = URL.createObjectURL(file)
      const extension = file.name.split('.').pop() || 'wav'
      const fullTitle = `${filename.trim()}.${extension}`

      const newRecording: RecordingWithMeta = {
        id: crypto.randomUUID(),
        title: fullTitle,
        audioBlob: file,
        audioUrl,
        transcription: null,
        createdAt: new Date(),
        type: 'recording',
        method: 'uploaded',
        isFavourite: false,
        isTranscribing: false,
        isSummarizing: false,
        error: undefined,
        duration: 0,
        fileSize: file.size
      }

      // Add to state
      addRecording(newRecording)

      // Save to localStorage
      const savedRecordings = JSON.parse(localStorage.getItem('voiceRecordings') || '[]')
      localStorage.setItem('voiceRecordings', JSON.stringify([newRecording, ...savedRecordings]))

      onClose()
    } catch (err) {
      setError('Failed to save recording')
      console.error('Error saving recording:', err)
    }
  }

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
      <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Upload Recording
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
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
            transition-colors mb-4
            ${isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : file 
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'
            }`}
        >
          {file ? (
            <>
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm text-gray-600">{file.name}</p>
            </>
          ) : (
            <>
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-gray-600">
                Drag & drop your audio file here or <span className="text-blue-500">browse</span>
              </p>
              <p className="text-xs text-gray-500">Supports MP3, WAV (up to 50MB)</p>
            </>
          )}
        </div>

        {/* Filename Input */}
        {file && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recording Name
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md 
                         text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter recording name"
              />
              <span className="text-gray-500 text-sm">{`.${file.name.split('.').pop()}`}</span>
            </div>
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
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          {file && (
            <button
              onClick={handleSave}
              disabled={!filename.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg 
                       hover:bg-blue-600 transition-colors font-medium
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Recording
            </button>
          )}
        </div>
      </div>
    </div>
  )
}