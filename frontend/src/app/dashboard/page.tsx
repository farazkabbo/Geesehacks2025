// src/app/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/app/components/layout/DashboardLayout'
import RecordingOptions from '@/app/components/recording/RecordingOptions'
import RecordingList from '@/app/components/recording/RecordingList'
import LoadingSpinner from '@/app/components/ui/LoadingSpinner'

function DashboardContent() {
  const router = useRouter()
  const { isLoaded, userId } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Redirect to login if user is not authenticated
    if (isLoaded && !userId) {
      router.push('/login')
    }
  }, [isLoaded, userId, router])

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
        <RecordingOptions onProcessingChange={setIsProcessing} />
      </section>

      {/* Recent Recordings Section */}
      <section className="bg-[#2D1B2E] rounded-lg p-6 border border-plum-800">
        <h2 className="text-2xl font-semibold text-plum-100 mb-6">Recent Recordings</h2>
        <RecordingList />
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