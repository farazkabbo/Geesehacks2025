// src/context/AppStateContext.tsx
'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import type { RecordingWithMeta } from '@/app/components/recording/types'

// Define our context type
interface AppStateContextType {
  recordings: RecordingWithMeta[]
  addRecording: (recording: RecordingWithMeta) => void
  updateRecordingTitle: (id: string, title: string) => void
  updateRecordingTranscription: (id: string, transcription: string) => void
}

// Create context with a meaningful initial value
const AppStateContext = createContext<AppStateContextType>({
  recordings: [],
  addRecording: () => {},
  updateRecordingTitle: () => {},
  updateRecordingTranscription: () => {}
})

// Create the provider component
export function AppStateProvider({ children }: { children: React.ReactNode }) {
  // Initialize state for recordings
  const [recordings, setRecordings] = useState<RecordingWithMeta[]>([])

  // Handler for adding new recordings
  const addRecording = useCallback((recording: RecordingWithMeta) => {
    setRecordings(current => [recording, ...current])
    // Save to localStorage for persistence
    try {
      const storedRecordings = JSON.parse(localStorage.getItem('recordings') || '[]')
      localStorage.setItem('recordings', JSON.stringify([recording, ...storedRecordings]))
    } catch (error) {
      console.error('Error saving recording:', error)
    }
  }, [])

  // Handler for updating recording titles
  const updateRecordingTitle = useCallback((id: string, title: string) => {
    setRecordings(current =>
      current.map(recording =>
        recording.id === id ? { ...recording, title } : recording
      )
    )
  }, [])

  // Handler for updating transcriptions
  const updateRecordingTranscription = useCallback((id: string, transcription: string) => {
    setRecordings(current =>
      current.map(recording =>
        recording.id === id ? { ...recording, transcription } : recording
      )
    )
  }, [])

  // Create the context value object
  const value = {
    recordings,
    addRecording,
    updateRecordingTitle,
    updateRecordingTranscription
  }

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  )
}

// Custom hook for using the context
export function useAppState() {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider')
  }
  return context
}