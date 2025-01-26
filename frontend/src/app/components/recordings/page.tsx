'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MoreVertical, Star, Trash2, Edit, ChevronRight } from 'lucide-react'
import DashboardLayout from '@/app/components/layout/DashboardLayout'
import { useAppState } from '@/context/AppStateContext'
import type { RecordingWithMeta } from '@/app/components/recording/types'

export default function RecordingsPage() {
  // Initialize router and get app state methods
  const router = useRouter()
  const {
    recordings: contextRecordings,
    addRecordingToFavourites,
    removeRecordingFromFavourites,
    moveRecordingToTrash,
    updateRecordingTitle,
    updateRecordingTranscription
  } = useAppState()

  // State management for recordings and UI interactions
  const [recordings, setRecordings] = useState<RecordingWithMeta[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState<string | null>(null)
  const [isRenaming, setIsRenaming] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [currentlyRenamingId, setCurrentlyRenamingId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Effect to handle sorting and deduplication of recordings
  useEffect(() => {
    const recordingsMap = new Map<string, RecordingWithMeta>()

    contextRecordings.forEach((recording: RecordingWithMeta) => {
      recordingsMap.set(recording.id, recording)
    })

    const uniqueRecordings = Array.from(recordingsMap.values())
    const sortedRecordings = uniqueRecordings.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    setRecordings(sortedRecordings)
  }, [contextRecordings])

  // Effect to handle clicking outside of menus
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement
      if (!target.closest('.menu-button') && !target.closest('.menu-content')) {
        setIsMenuOpen(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Utility function to format dates consistently
  const formatDate = (date: Date) => {
    const utcDate = new Date(date)

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    }).format(utcDate)
  }

  // Handler for renaming recordings
  const handleRename = (recording: RecordingWithMeta, e: React.MouseEvent) => {
    e.stopPropagation()
    const extension = recording.title?.split('.').pop() || 'wav'
    const nameWithoutExt = recording.title
      ? recording.title.replace(`.${extension}`, '')
      : recording.title || ''

    setNewTitle(nameWithoutExt)
    setCurrentlyRenamingId(recording.id)
    setIsRenaming(recording.id)
    setIsMenuOpen(null)
  }

  // Save the renamed recording
  const saveRename = (id: string) => {
    if (!newTitle.trim()) return

    const recording = recordings.find(r => r.id === id)
    const extension = recording?.title?.split('.').pop() || 'wav'

    const fullTitle = `${newTitle.trim()}.${extension}`
    updateRecordingTitle(id, fullTitle)
    setIsRenaming(null)
    setCurrentlyRenamingId(null)
    setNewTitle('')
  }

  // Handler for deleting recordings
  const handleDelete = (recording: RecordingWithMeta, e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteConfirm(recording.id)
    setIsMenuOpen(null)
  }

  // Confirm and execute recording deletion
  const confirmDelete = (id: string) => {
    const recording = recordings.find(r => r.id === id)
    if (recording) {
      moveRecordingToTrash(recording)
    }
    setShowDeleteConfirm(null)
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-plum-100">My Recordings</h1>

        {/* Empty State */}
        {recordings.length === 0 ? (
          <div className="text-center py-12 bg-[#2D1B2E] rounded-lg border border-plum-800">
            <p className="text-plum-200 text-lg">No recordings yet</p>
          </div>
        ) : (
          // Recordings List
          <div className="space-y-4">
            {recordings.map((recording) => (
              <div
                key={recording.id}
                className="bg-[#2D1B2E] border border-plum-800 rounded-lg p-4 hover:bg-[#3D2B3E] 
                         transition-all duration-200 relative"
                onMouseEnter={() => setHoveredId(recording.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="flex items-center justify-between">
                  {/* Recording Info */}
                  <div
                    className="flex-grow cursor-pointer"
                    onClick={() => router.push(`/recordings/${recording.id}`)}
                  >
                    <h3 className="text-lg font-semibold text-plum-100">
                      {recording.title || `Recording from ${formatDate(recording.createdAt)}`}
                    </h3>
                    <p className="text-sm text-plum-300">
                      {recording.method === 'uploaded' ? 'Uploaded' : 'Recorded'} on {formatDate(recording.createdAt)}
                    </p>
                  </div>

                  {/* Actions Menu */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => recording.isFavourite
                        ? removeRecordingFromFavourites(recording.id)
                        : addRecordingToFavourites(recording)
                      }
                      className={`p-2 rounded-lg transition-colors ${recording.isFavourite
                          ? 'text-yellow-400 hover:bg-yellow-400/10'
                          : 'text-plum-300 hover:bg-plum-700/30'
                        }`}
                    >
                      <Star className="w-5 h-5" fill={recording.isFavourite ? "currentColor" : "none"} />
                    </button>

                    <button
                      onClick={(e) => handleRename(recording, e)}
                      className="p-2 text-plum-300 hover:bg-plum-700/30 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>

                    <button
                      onClick={(e) => handleDelete(recording, e)}
                      className="p-2 text-plum-300 hover:bg-plum-700/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    <ChevronRight
                      className={`w-5 h-5 text-plum-300 transition-opacity duration-200 ${hoveredId === recording.id ? 'opacity-100' : 'opacity-0'
                        }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rename Modal */}
        {isRenaming && currentlyRenamingId && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-[#2D1B2E] rounded-lg p-6 w-[400px] border border-plum-800">
              <h2 className="text-lg font-semibold text-plum-100 mb-4">Rename Recording</h2>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="flex-grow px-3 py-2 bg-[#1D1321] border border-plum-700 text-plum-100 
                           rounded-lg focus:outline-none focus:ring-2 focus:ring-plum-500"
                  autoFocus
                />
                <span className="text-plum-300 text-sm">
                  {`.${recordings.find(r => r.id === currentlyRenamingId)?.title?.split('.').pop() || 'wav'}`}
                </span>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => {
                    setIsRenaming(null)
                    setCurrentlyRenamingId(null)
                    setNewTitle('')
                  }}
                  className="px-4 py-2 text-sm text-plum-300 hover:bg-plum-700/30 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveRename(currentlyRenamingId)}
                  disabled={!newTitle.trim()}
                  className="px-4 py-2 text-sm text-white bg-plum-500 rounded-lg hover:bg-plum-600 
                           transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-[#2D1B2E] rounded-lg p-6 w-[400px] border border-plum-800">
              <h2 className="text-lg font-semibold text-plum-100 mb-2">Delete Recording</h2>
              <p className="text-plum-300 mb-4">
                Are you sure you want to delete this recording? Items in trash will be automatically
                deleted after 30 days.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-plum-300 hover:bg-plum-700/30 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDelete(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}