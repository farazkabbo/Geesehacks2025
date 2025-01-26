'use client'

import { useState } from 'react'
import {
  Mic,
  FileAudio,
  Trash2,
  Menu,
  Upload,
  FileText,
  BookOpen
} from 'lucide-react'
import Link from 'next/link'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-plum-100 to-plum-400">
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white
        border-r border-plum-800 shadow-lg transform transition-transform 
        duration-300 ease-in-out z-30
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="p-6 border-b border-black mb-11">
            <h1 className="text-2xl font-bold text-black">Minute Master</h1>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-2">
            <Link href="/dashboard"
              className="flex items-center space-x-3 text-black hover:bg-plum-700/40 active:bg-plum-600/40 p-3 rounded-lg transition-all">
              <FileAudio className="w-5 h-5" />
              <span>Recordings</span>
            </Link>

            <Link href="/dashboard/trash"
              className="flex items-center space-x-3 text-black hover:bg-plum-700/40 active:bg-plum-600/40 p-3 rounded-lg transition-all">
              <Trash2 className="w-5 h-5" />
              <span>Trash</span>
            </Link>
          </nav>
        </div>
      </aside>



      {/* Main Content Area */}
      <main className={`
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'ml-64' : 'ml-0'}
      `}>
        <div className="p-8">
          {children}
        </div>
      </main>

      {/* Toggle Sidebar Button */}
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-40 p-2 bg-plum-800/90 rounded-lg text-plum-100 hover:bg-plum-700 transition-colors shadow-md"
      >
        <Menu className="w-5 h-5" />
      </button>
    </div>
  )
}
