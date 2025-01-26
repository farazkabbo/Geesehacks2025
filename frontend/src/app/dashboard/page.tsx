'use client'

import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/app/components/layout/DashboardLayout'
import RecordingOptions from '@/app/components/recording/RecordingOption'
import LoadingSpinner from '@/app/components/ui/LoadingSpinner'
import { useAppState } from '@/context/AppStateContext'

function DashboardContent() {
  const router = useRouter()
  const { isLoaded, userId } = useAuth()
  
  // We're keeping just the addRecording function from our app state
  const { addRecording } = useAppState()

  // This effect handles our authentication check
  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/login')
    }
  }, [isLoaded, userId, router])

  // Show loading state while checking authentication
  if (!isLoaded) {
    return <LoadingSpinner />
  }

  // Return null if there's no authenticated user
  if (!userId) {
    return null
  }

  return (
    <div className="space-y-8 p-6">
      {/* Main Recording Section */}
      <section className="bg-[#2D1B2E] rounded-lg p-6 border border-plum-800">
        <h2 className="text-2xl font-semibold text-plum-100 mb-6">Meeting Recorder</h2>
        <RecordingOptions />
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