// src/app/components/recording/RecordingList.tsx
'use client'

import { FileAudio, Trash2, Download, FileText } from 'lucide-react'

interface Recording {
  id: string
  name: string
  duration: number
  createdAt: Date
  transcription?: string
  summary?: string
}

interface RecordingListProps {
  recordings: Recording[]
}

export default function RecordingList({ recordings }: RecordingListProps) {
  if (recordings.length === 0) {
    return (
      <div className="text-center py-12">
        <FileAudio className="w-16 h-16 mx-auto text-plum-400 mb-4" />
        <h3 className="text-lg font-medium text-plum-100 mb-2">No Recordings Yet</h3>
        <p className="text-plum-300">Start by recording or uploading your first meeting</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {recordings.map((recording) => (
        <div 
          key={recording.id}
          className="bg-[#1D1321] p-4 rounded-lg border border-plum-800"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <FileAudio className="w-5 h-5 text-plum-400" />
              <span className="text-plum-100 font-medium">{recording.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-plum-300 hover:text-plum-200 transition-colors">
                <Download className="w-5 h-5" />
              </button>
              <button className="p-2 text-plum-300 hover:text-red-400 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {recording.transcription && (
            <div className="mt-4 p-3 bg-plum-800/20 rounded-lg">
              <div className="flex items-center text-plum-300 mb-2">
                <FileText className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Transcription</span>
              </div>
              <p className="text-plum-200 text-sm">{recording.transcription}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}