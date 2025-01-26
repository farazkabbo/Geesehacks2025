'use client'

import { useState } from 'react'
import RecordingModal from './RecordingModal'
import UploadRecording from './UploadRecording'
import { type ModalType } from './types'

export default function RecordingOptions() {
  // Track which modal should be open (can be 'record', 'upload', or null)
  const [modalType, setModalType] = useState<ModalType>(null)

  // Handler functions for opening different modals
  const handleAutoRecord = () => setModalType('record')
  const handleUpload = () => setModalType('upload')
  const handleCloseModal = () => setModalType(null)

  return (
    <div className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Auto Recording Card */}
        <div 
          onClick={handleAutoRecord} 
          className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer group"
        >
          <div className="flex items-start gap-4">
            {/* Microphone Icon */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-500 transition-colors">
                Start Auto Recording
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Begin recording instantly with our AI-powered transcription. Perfect for live lectures and study sessions.
              </p>
              
              <button 
                onClick={handleAutoRecord}
                className="mt-4 inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 text-sm font-medium"
              >
                Quick Start
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Upload Recording Card */}
        <div 
          onClick={handleUpload}
          className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer group"
        >
          <div className="flex items-start gap-4">
            {/* Upload Icon */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-500 transition-colors">
                Upload Recording
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Upload existing recordings for AI transcription. Supports various audio formats for your convenience.
              </p>
              
              <button 
                onClick={handleUpload}
                className="mt-4 inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 text-sm font-medium"
              >
                Choose File
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Components - Only render when their respective modalType is active */}
      {modalType === 'record' && (
        <RecordingModal 
          isOpen={true}
          onClose={handleCloseModal}
          modalType="record"
        />
      )}
      
      {modalType === 'upload' && (
        <UploadRecording 
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}