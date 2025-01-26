
'use client'

import { FileAudio, Trash2, Download } from 'lucide-react'

export default function RecordingList() {
  // This will be expanded later to show actual recordings
  return (
    <div className="space-y-4">
      <div className="text-center py-12">
        <FileAudio className="w-16 h-16 mx-auto text-plum-400 mb-4" />
        <h3 className="text-lg font-medium text-plum-100 mb-2">No Recordings Yet</h3>
        <p className="text-plum-300">Start by recording or uploading your first meeting</p>
      </div>
    </div>
  )
}