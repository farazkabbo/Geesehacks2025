'use client'

import { useState, useRef, useCallback } from 'react'
import { useAppState } from '@/context/AppStateContext'
import type { RecordingWithMeta } from '@/app/components/recording/types'

type ModalType = 'record' | 'upload'
type RecordingStatus = 'idle' | 'recording' | 'paused'
type DialogType = 'none' | 'save' | 'exit' | 'saveAndExit'

interface RecordingModalProps {
  isOpen: boolean
  onClose: () => void
  modalType: ModalType
}

export default function RecordingModal({ isOpen, onClose, modalType }: RecordingModalProps) {
  const { addRecording } = useAppState()

  // Core states
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle')
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isLightColor, setIsLightColor] = useState(false)
  const [currentDialog, setCurrentDialog] = useState<DialogType>('none')
  const [filename, setFilename] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isClosing, setIsClosing] = useState(false)
  
  // Refs for managing audio
  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])
  const timerRef = useRef<{
    timer: ReturnType<typeof setInterval> | null
    color: ReturnType<typeof setInterval> | null
  } | null>(null)

  // Reset all states and stop recording
  const resetRecording = () => {
    setRecordingStatus('idle')
    setElapsedTime(0)
    setIsLightColor(false)
    setFilename('')
    setError(null)
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null
    audioChunks.current = []
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop()
    }
    mediaRecorderRef.current = null
  }

  // Timer management
  const startTimer = () => {
    const startTime = Date.now() - elapsedTime
    const timer = setInterval(() => {
      setElapsedTime(Date.now() - startTime)
    }, 10)

    const colorInterval = setInterval(() => {
      setIsLightColor(prev => !prev)
    }, 1500)

    timerRef.current = { timer, color: colorInterval }
  }

  const stopTimer = () => {
    if (timerRef.current?.timer) {
      clearInterval(timerRef.current.timer)
    }
    if (timerRef.current?.color) {
      clearInterval(timerRef.current.color)
    }
    timerRef.current = null
  }

  // Recording functions
  const startRecording = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream)

      mediaRecorderRef.current = mediaRecorder
      audioChunks.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.current.push(event.data)
      }

      mediaRecorder.start()
      setRecordingStatus('recording')
      startTimer()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording')
      console.error('Recording error:', err)
    }
  }, [])

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause()
      stopTimer()
      setRecordingStatus('paused')
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume()
      startTimer()
      setRecordingStatus('recording')
    }
  }

  const stopRecordingAndSave = () => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop()
      stopTimer()
      setCurrentDialog('save')
      setRecordingStatus('idle')
    }
  }

  const handleSave = () => {
    if (!filename.trim()) return

    // Create recording object
    const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' })
    const audioUrl = URL.createObjectURL(audioBlob)

    const newRecording: RecordingWithMeta = {
      id: crypto.randomUUID(),
      title: filename.trim().endsWith('.wav') ? filename.trim() : `${filename.trim()}.wav`,
      audioBlob: audioBlob,
      audioUrl,
      transcription: null,
      createdAt: new Date(),
      type: 'recording',
      method: 'recorded',
      isFavourite: false,
      isTranscribing: false,
      error: undefined
    }

    // Update localStorage
    const savedRecordings = JSON.parse(localStorage.getItem('voiceRecordings') || '[]')
    localStorage.setItem('voiceRecordings', JSON.stringify([newRecording, ...savedRecordings]))

    // Add to app state
    addRecording(newRecording)

    // Reset state
    setCurrentDialog('none')
    setFilename('')
    
    if (isClosing) {
      onClose()
    } else {
      resetRecording()
    }
  }

  const handleClose = () => {
    if (recordingStatus === 'recording') {
      pauseRecording()
      setIsClosing(true)
      setCurrentDialog('saveAndExit')
    } else if (recordingStatus === 'paused') {
      setIsClosing(true)
      setCurrentDialog('saveAndExit')
    } else {
      onClose()
    }
  }

  const handleDiscard = () => {
    resetRecording()
    if (isClosing) {
      onClose()
    }
  }

  // Format time display
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    const ms = Math.floor((milliseconds % 1000) / 10)
    return (
      <>
        {mins > 0 && `${mins}:`}
        {secs.toString().padStart(2, '0')}
        <span className="text-3xl">:{ms.toString().padStart(2, '0')}</span>
      </>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-6 w-96">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {recordingStatus === 'recording'
              ? 'Recording in Progress'
              : recordingStatus === 'paused'
              ? 'Recording Paused'
              : 'Voice Recording'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Timer Display */}
        <div className="text-center">
          <div className="relative w-48 h-48 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full bg-white flex items-center justify-center">
              <span
                className={`text-5xl font-mono transition-all duration-[4000ms] ease-in-out ${
                  recordingStatus === 'recording'
                    ? isLightColor
                      ? 'text-[#d9e6fe]'
                      : 'text-[#3473ef]'
                    : 'text-gray-400'
                }`}
              >
                {formatTime(elapsedTime)}
              </span>
            </div>

            {/* Recording Animation */}
            {recordingStatus === 'recording' && (
              <div className="absolute inset-0">
                <div className="absolute inset-0 rounded-full border-4 border-blue-500 opacity-20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-500 opacity-20 animate-ping"></div>
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex gap-4 justify-center">
            {recordingStatus === 'idle' ? (
              <button
                onClick={startRecording}
                className="w-full py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Start Recording
              </button>
            ) : (
              <>
                <button
                  onClick={recordingStatus === 'recording' ? pauseRecording : resumeRecording}
                  className="flex-1 py-3 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {recordingStatus === 'recording' ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={stopRecordingAndSave}
                  className={`flex-1 py-3 rounded-lg text-white transition-all hover:scale-[1.02] active:scale-[0.98] ${
                    recordingStatus === 'recording'
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {recordingStatus === 'recording' ? 'Stop' : 'Save'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Save Dialog */}
        {currentDialog === 'save' && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[10000]">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Save Recording</h3>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="Enter filename"
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-lg-l 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  autoFocus
                />
                <span className="text-gray-500 text-sm">.wav</span>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setCurrentDialog('none')
                    resetRecording()
                  }}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!filename.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save and Exit Dialog */}
        {currentDialog === 'saveAndExit' && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[10000]">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Save Recording?</h3>
              <p className="text-gray-600 mb-6">Would you like to save this recording before exiting?</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleDiscard}
                  className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={() => setCurrentDialog('save')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}