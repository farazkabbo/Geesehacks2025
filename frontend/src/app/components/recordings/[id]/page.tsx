'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import DashboardLayout from '@/app/components/layout/DashboardLayout'
import ReactMarkdown from 'react-markdown'
import { 
  PlayCircle,
  PauseCircle,
  FileText, 
  ClipboardList,
  ChevronLeft,
  Volume2,
  AlertTriangle,
} from 'lucide-react'
import type { RecordingWithMeta } from '@/app/components/recording/types'

export default function RecordingPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from')
  
  // Core states
  const [isMounted, setIsMounted] = useState(false)
  const [recording, setRecording] = useState<RecordingWithMeta | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [expandedTranscription, setExpandedTranscription] = useState(false)
  const [expandedSummary, setExpandedSummary] = useState(false)
  const [transcribingRecordingId, setTranscribingRecordingId] = useState<string | null>(null)
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null)
  
  // Audio refs
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  // Initialize mounting state
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Load recording from localStorage
  useEffect(() => {
    if (isMounted) {
      const storedRecordings = localStorage.getItem('voiceRecordings')
      if (storedRecordings) {
        const parsedRecordings: RecordingWithMeta[] = JSON.parse(storedRecordings).map((rec: RecordingWithMeta) => ({
          ...rec,
          createdAt: new Date(rec.createdAt),
          audioBlob: typeof rec.audioBlob === 'string' ? rec.audioBlob : ''
        }))
        const currentRecording = parsedRecordings.find(rec => rec.id === params.id)
        if (currentRecording) {
          setRecording(currentRecording)
          // Initialize audio element
          const audio = new Audio(currentRecording.audioUrl)
          audio.volume = volume
          audioRef.current = audio
          
          // Set up audio event listeners
          audio.addEventListener('loadedmetadata', () => {
            setDuration(audio.duration)
          })
          
          audio.addEventListener('timeupdate', () => {
            setCurrentTime(audio.currentTime)
          })
          
          audio.addEventListener('ended', () => {
            setIsPlaying(false)
            setCurrentTime(0)
          })
        }
      }
    }
  }, [params.id, isMounted, volume])

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.removeEventListener('loadedmetadata', () => {})
        audioRef.current.removeEventListener('timeupdate', () => {})
        audioRef.current.removeEventListener('ended', () => {})
      }
    }
  }, [])

  const handleTranscribe = async () => {
    if (!recording) return
  
    const supportedTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav']
  
    try {
      setTranscribingRecordingId(recording.id)
      setTranscriptionError(null)
  
      if (!recording.audioUrl) {
        throw new Error('No audio file available')
      }
  
      const response = await fetch(recording.audioUrl)
      const blob = await response.blob()
  
      if (!supportedTypes.includes(blob.type)) {
        throw new Error('Unsupported audio file type')
      }
  
      const audioFile = new File([blob], 'recording.wav', { type: blob.type })
  
      if (audioFile.size > 50 * 1024 * 1024) {
        throw new Error('File size exceeds 50MB limit')
      }
  
      const formData = new FormData()
      formData.append('file', audioFile)
  
      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      })
  
      if (!transcribeResponse.ok) {
        const errorData = await transcribeResponse.json()
        throw new Error(errorData.error || 'Transcription failed')
      }
  
      const data = await transcribeResponse.json()
  
      const updatedRecording = {
        ...recording,
        transcription: data.transcription,
        isTranscribing: false,
        error: undefined
      }
  
      setRecording(updatedRecording)
      updateLocalStorage(updatedRecording)
  
    } catch (err: any) {
      console.error('Transcription Error:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      })
  
      const errorMessage = err.message || 'Unable to transcribe audio'
      setTranscriptionError(errorMessage)
      setRecording(prev => prev ? {
        ...prev,
        error: errorMessage
      } : null)
  
    } finally {
      setTranscribingRecordingId(null)
    }
  }

  const getBackButtonText = () => {
    switch(from) {
      case '/favourites':
        return 'Back to Favourites'
      case '/dashboard':
        return 'Back to Dashboard'
      default:
        return 'Back to Recordings'
    }
  }

  // Summarize functionality
  const summarizeTranscription = async () => {
    if (!recording?.transcription) {
      alert('Please transcribe the recording first')
      return
    }

    try {
      setRecording(prev => prev ? {
        ...prev,
        isSummarizing: true,
        error: undefined
      } : null)

      const response = await fetch('/api/summarise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcription: recording.transcription
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate summary')
      }

      const data = await response.json()

      const updatedRecording = {
        ...recording,
        summary: data.summary,
        isSummarizing: false,
        error: undefined
      }

      setRecording(updatedRecording)
      updateLocalStorage(updatedRecording)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate summary'
      setRecording(prev => prev ? {
        ...prev,
        isSummarizing: false,
        error: errorMessage,
        summary: undefined
      } : null)
    }
  }

  // Audio control functions
  const togglePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressBarRef.current) return

    const bounds = progressBarRef.current.getBoundingClientRect()
    const x = e.clientX - bounds.left
    const percentage = x / bounds.width
    const newTime = percentage * duration

    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  // Helper functions
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const updateLocalStorage = (updatedRecording: RecordingWithMeta) => {
    const storedRecordings = localStorage.getItem('voiceRecordings')
    if (storedRecordings) {
      const recordings: RecordingWithMeta[] = JSON.parse(storedRecordings)
      const updatedRecordings = recordings.map(rec => 
        rec.id === updatedRecording.id ? updatedRecording : rec
      )
      localStorage.setItem('voiceRecordings', JSON.stringify(updatedRecordings))
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  if (!isMounted) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
          <p className="text-gray-500">Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!recording) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
          <p className="text-gray-500">Recording not found</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push(from || '/recordings')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          {getBackButtonText()}
        </button>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {recording.title || `Recording from ${formatDate(recording.createdAt)}`}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {recording.method === 'uploaded' ? 'Uploaded' : 'Recorded'} on {formatDate(recording.createdAt)}
              </p>
            </div>
          </div>

          {/* Audio Player */}
          <div className="mb-8 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-4 mb-4">
              <button 
                onClick={togglePlayPause}
                className="text-blue-500 hover:text-blue-600"
              >
                {isPlaying ? (
                  <PauseCircle className="w-12 h-12" />
                ) : (
                  <PlayCircle className="w-12 h-12" />
                )}
              </button>

              <div className="flex-1">
                <div 
                  ref={progressBarRef}
                  onClick={handleProgressClick}
                  className="h-2 bg-gray-200 rounded-full cursor-pointer"
                >
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-gray-500" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mb-8">
            {!recording.transcription && (
              <button
                onClick={handleTranscribe}
                disabled={transcribingRecordingId === recording.id}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  transcribingRecordingId === recording.id
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                <FileText className="w-5 h-5" />
                {transcribingRecordingId === recording.id ? 'Transcribing...' : 'Transcribe'}
              </button>
            )}

            {recording.transcription && (
              <button
              onClick={summarizeTranscription}
              disabled={recording.isSummarizing}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                recording.isSummarizing
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              <ClipboardList className="w-5 h-5" />
              {recording.isSummarizing ? 'Summarizing...' : 'Summarize'}
            </button>
          )}
        </div>

        {/* Error Message */}
        {recording.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{recording.error}</p>
          </div>
        )}

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Transcription Section */}
          {recording.transcription && (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Transcription
                </h2>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {recording.transcription.length > 300 && !expandedTranscription
                    ? `${recording.transcription.slice(0, 300)}...`
                    : recording.transcription}
                </p>
                {recording.transcription.length > 300 && (
                  <button
                    onClick={() => setExpandedTranscription(!expandedTranscription)}
                    className="text-blue-500 hover:text-blue-600 mt-4"
                  >
                    {expandedTranscription ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Summary Section */}
          {recording.summary && (
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  Summary
                </h2>
              </div>
              <div className="prose max-w-none">
                <ReactMarkdown 
                  className="text-gray-700 leading-relaxed"
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-semibold mt-4 mb-3" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-medium mt-3 mb-2" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                    em: ({node, ...props}) => <em className="italic" {...props} />,
                    blockquote: ({node, ...props}) => (
                      <blockquote className="border-l-4 border-green-500 pl-4 my-4 italic" {...props} />
                    ),
                    ul: ({node, ...props}) => <ul className="list-disc pl-6 my-4" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-6 my-4" {...props} />,
                    li: ({node, ...props}) => <li className="my-1" {...props} />,
                    p: ({node, ...props}) => <p className="my-2" {...props} />,
                  }}
                >
                  {recording.summary.length > 300 && !expandedSummary
                    ? `${recording.summary.slice(0, 300)}...`
                    : recording.summary
                  }
                </ReactMarkdown>
                {recording.summary.length > 300 && (
                  <button
                    onClick={() => setExpandedSummary(!expandedSummary)}
                    className="text-green-500 hover:text-green-600 mt-4"
                  >
                    {expandedSummary ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </DashboardLayout>
  )
}