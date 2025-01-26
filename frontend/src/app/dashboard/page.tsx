// src/app/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/app/components/layout/DashboardLayout'
import RecordingOptions from '@/app/components/recording/RecordingOptions'
import RecordingList from '@/app/components/recording/RecordingList'
import LoadingSpinner from '@/app/components/ui/LoadingSpinner'

// Interface for our recording type
interface Recording {
  id: string
  name: string
  duration: number
  createdAt: Date
  transcription?: string
  summary?: string
}

function DashboardContent() {
  const router = useRouter()
  const { isLoaded, userId } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [recordings, setRecordings] = useState<Recording[]>([])

  // Authentication check effect
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/login')
    }
  }, [isLoaded, userId, router])

  // Handler for processing state changes
  const handleProcessingChange = (processing: boolean) => {
    setIsProcessing(processing)
  }

  // Handler for new recordings
  const handleNewRecording = (recording: Recording) => {
    setRecordings(prev => [recording, ...prev])
  }

  if (!isLoaded) {
    return <LoadingSpinner />
  }

  if (!userId) {
    return null
  }

  return (
    <div className="space-y-8 p-6">
      {/* Main Recording Section */}
      <section className="bg-[#2D1B2E] rounded-lg p-6 border border-plum-800">
        <h2 className="text-2xl font-semibold text-plum-100 mb-6">Meeting Recorder</h2>
        <RecordingOptions 
          onProcessingChange={handleProcessingChange}
          onNewRecording={handleNewRecording}
          disabled={isProcessing}
        />
      </section>

      {/* Recent Recordings Section */}
      <section className="bg-[#2D1B2E] rounded-lg p-6 border border-plum-800">
        <h2 className="text-2xl font-semibold text-plum-100 mb-6">Recent Recordings</h2>
        <RecordingList recordings={recordings} />
      </section>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  )
}