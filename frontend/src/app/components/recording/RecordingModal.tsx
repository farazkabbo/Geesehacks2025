'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { FileText, BookOpen, X, Mic } from 'lucide-react'

type ModalType = 'record' | 'upload'
type RecordingStatus = 'idle' | 'recording' | 'paused'

interface RecordingModalProps {
  isOpen: boolean
  onClose: () => void
  modalType: ModalType
}

export default function RecordingModal({ isOpen, onClose, modalType }: RecordingModalProps) {
  // Core states
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle')
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isLightColor, setIsLightColor] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Transcription and summarization states
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [transcription, setTranscription] = useState<string | null>(null)
  const [summary, setSummary] = useState<string | null>(null)

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
    setError(null)
    setTranscription(null)
    setSummary(null)
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null
    audioChunks.current = []
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop()
    }
    mediaRecorderRef.current = null
  }

  // Transcription API call
  const handleTranscribe = async () => {
    if (audioChunks.current.length === 0) return

    try {
      setIsTranscribing(true)
      setError(null)

      const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' })
      const formData = new FormData()
      formData.append('file', audioBlob, `recording_${Date.now()}.wav`)

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.transcription) {
        throw new Error('No transcription text received')
      }

      setTranscription(data.transcription)
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'An unexpected error occurred during transcription'

      setError(errorMessage)
      console.error('Transcription error:', err)
    } finally {
      setIsTranscribing(false)
    }
  }

  // Summarization API call
  const handleSummarize = async () => {
    if (!transcription) return

    try {
      setIsSummarizing(true)
      setError(null)

      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: transcription })
      })

      if (!response.ok) {
        throw new Error(`Summarization failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.summary) {
        throw new Error('No summary text received')
      }

      setSummary(data.summary)
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'An unexpected error occurred during summarization'

      setError(errorMessage)
      console.error('Summarization error:', err)
    } finally {
      setIsSummarizing(false)
    }
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
        if (event.data.size > 0) {
          audioChunks.current.push(event.data)
        }
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
      setRecordingStatus('idle')
    }
  }

  // Use effect to handle post-recording state
  useEffect(() => {
    if (recordingStatus === 'idle' && audioChunks.current.length > 0) {
      // Optional: Automatically trigger transcription
      // handleTranscribe()
    }
  }, [recordingStatus])

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
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
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
                className={`text-5xl font-mono transition-all duration-[4000ms] ease-in-out ${recordingStatus === 'recording'
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
                  className={`flex-1 py-3 rounded-lg text-white transition-all hover:scale-[1.02] active:scale-[0.98] ${recordingStatus === 'recording'
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                >
                  {recordingStatus === 'recording' ? 'Stop' : 'Save'}
                </button>
              </>
            )}
          </div>

          {/* Transcription and Summarization Buttons */}
          {recordingStatus === 'idle' && audioChunks.current.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex gap-4">
                <button
                  onClick={handleTranscribe}
                  disabled={isTranscribing}
                  className="flex-1 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  {isTranscribing ? 'Transcribing...' : 'Transcribe'}
                </button>

                {transcription && (
                  <button
                    onClick={handleSummarize}
                    disabled={isSummarizing}
                    className="flex-1 py-3 rounded-lg bg-purple-500 hover:bg-purple-600 text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-5 h-5" />
                    {isSummarizing ? 'Summarizing...' : 'Summarize'}
                  </button>
                )}
              </div>

              {/* Transcription Display */}
              {transcription && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Transcription</h4>
                  <p className="text-sm text-gray-600 max-h-32 overflow-y-auto">{transcription}</p>
                </div>
              )}

              {/* Summary Display */}
              {summary && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Summary</h4>
                  <p className="text-sm text-gray-600 max-h-32 overflow-y-auto">{summary}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}