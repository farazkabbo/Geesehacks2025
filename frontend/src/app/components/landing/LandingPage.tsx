'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Mic,
  Brain,
  Calendar,
  Users,
  Clock,
  FileText,
  Linkedin,
  BookOpen
} from 'lucide-react'
import Image from 'next/image'

// Import team member images
import MohammedFarazKabbo from '/public/uploads/faraz.jpg'
import NiloySaha from '/public/uploads/nithin.jpg'
import AtulRoi from '/public/uploads/atul.jpg'     // Add this new import
import Jahiem from '/public/uploads/jahiem.jpg'
const LandingPage = () => {
  const router = useRouter()
  const [typedText, setTypedText] = useState('')
  const fullText = 'Your AI powered office meeting assistant'
  const [isVisible, setIsVisible] = useState(false)

  // Initialize visibility when component mounts
  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Typing animation effect
  useEffect(() => {
    let currentIndex = 0
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(typingInterval)
      }
    }, 50)

    return () => clearInterval(typingInterval)
  }, [])

  // Office-focused features
  const features = [
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Smart Meeting Recording",
      description: "Crystal clear audio capture with automatic speaker identification and noise cancellation for professional meetings"
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI Meeting Minutes",
      description: "Transform conversations into structured meeting minutes with action items and key decisions highlighted"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Time Analytics",
      description: "Track meeting efficiency, speaking time distribution, and agenda completion rates"
    }
  ]

  // Team member information
  const creators = [
    {
      name: "Mohammed Faraz Kabbo",
      linkedin: "https://www.linkedin.com/in/mohammed-faraz-kabbo/",
      role: "BSc (Hons.) Computer Science @ York University",
      photo: MohammedFarazKabbo
    },
    {
      name: "Nitin Vijay Anand",
      linkedin: "https://www.linkedin.com/in/niloysaha24/",
      role: "BEng Computer Engineering @ Toronto Metropolitan University",
      photo: NiloySaha
    },
    {
      name: "Atul Roi",
      linkedin: "https://www.linkedin.com/in/atul5rao//",    // Update with actual LinkedIn URL
      role: "BEng Software Engineering @ Mcmaster University",        // Update with actual role/university
      photo: AtulRoi
    },
    {
      name: "Jahiem",
      linkedin: "https://www.linkedin.com/in/jahiem/",      // Update with actual LinkedIn URL
      role: "BASc Computer Science @ York University",        // Update with actual role/university
      photo: Jahiem
    }
  ]

  // Navigation handler
  const handleGetStarted = () => {
    router.push('/signup')
  }

  return (
    <div className="min-h-screen bg-[#1D1321]">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8">
            {/* Animated Subtitle */}
            <div className={`transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
              <h2 className="text-xl md:text-2xl font-light tracking-wide
                           bg-gradient-to-r from-plum-400 via-plum-300 to-plum-400 
                           text-transparent bg-clip-text bg-300% animate-shimmer">
                {typedText}
                <span className="animate-pulse">|</span>
              </h2>
            </div>

            {/* Main Headline */}
            <div className={`space-y-2 transform transition-all duration-1000 delay-300 
                           ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
                Meetings are more
              </h1>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r 
                           from-plum-400 to-plum-600 text-transparent bg-clip-text">
                Productive
              </h1>
            </div>

            {/* Description */}
            <p className={`text-lg text-gray-300 max-w-2xl font-light leading-relaxed
                          transform transition-all duration-1000 delay-500 
                          ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              Transform your meetings with AI-powered recording, transcription, and analytics.
              Get instant meeting minutes, action items, and insights to make every meeting count.
            </p>

            {/* CTA Button */}
            <div className={`transform transition-all duration-1000 delay-700 
                           ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-plum-500 text-white rounded-xl text-lg font-medium 
                         hover:bg-plum-600 transition-all duration-300 
                         shadow-lg shadow-plum-500/25 hover:scale-105"
              >
                Start organizing your meetings now
              </button>
            </div>
          </div>

          {/* Right Side - Dashboard Preview */}
          <div className={`relative h-[600px] bg-[#2D1B2E] rounded-2xl overflow-hidden 
                          shadow-2xl border border-plum-800 transform transition-all 
                          duration-1000 delay-1000 
                          ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-plum-500/10 to-transparent" />
            <div className="relative z-10 w-full h-full p-6">
              {/* Meeting Dashboard Layout */}
              <div className="grid grid-cols-3 gap-4 h-full">
                {/* Sidebar - Meeting List */}
                <div className="bg-[#1D1321] rounded-xl p-4">
                  <h3 className="text-plum-100 font-semibold mb-4">Active Meetings</h3>
                  <div className="space-y-3">
                    <div className="bg-plum-800/20 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-plum-100">Q1 Planning</span>
                        <span className="text-plum-300 text-sm">45min</span>
                      </div>
                      <div className="flex items-center text-plum-300 text-sm">
                        <Users className="w-4 h-4 mr-1" />
                        <span>8 participants</span>
                      </div>
                    </div>
                    <div className="bg-plum-800/20 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-plum-100">Team Sync</span>
                        <span className="text-plum-300 text-sm">15min</span>
                      </div>
                      <div className="flex items-center text-plum-300 text-sm">
                        <Users className="w-4 h-4 mr-1" />
                        <span>5 participants</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-[#1D1321] rounded-xl p-6 col-span-2">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-plum-100 font-semibold">Current Meeting: Product Review</h3>
                      <span className="text-plum-300">
                        <Clock className="w-4 h-4 inline mr-1" />
                        00:23:45
                      </span>
                    </div>

                    {/* Live Transcription */}
                    <div className="bg-plum-800/20 p-4 rounded-lg mb-4">
                      <h4 className="text-plum-200 font-medium mb-3">Live Transcription</h4>
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <span className="text-plum-400 font-medium mr-2">Sarah:</span>
                          <p className="text-plum-300 text-sm">We should focus on improving user engagement...</p>
                        </div>
                        <div className="flex items-start">
                          <span className="text-plum-400 font-medium mr-2">Michael:</span>
                          <p className="text-plum-300 text-sm">The metrics show a 15% drop in daily active users.</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Items */}
                    <div className="bg-plum-800/20 p-4 rounded-lg">
                      <div className="flex items-center mb-3">
                        <FileText className="w-5 h-5 text-plum-300 mr-2" />
                        <span className="text-plum-200 font-medium">Action Items</span>
                      </div>
                      <ul className="text-plum-300 text-sm space-y-2">
                        <li className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-plum-400 mr-2" />
                          Review Q1 user feedback
                        </li>
                        <li className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-plum-400 mr-2" />
                          Prepare engagement improvement proposal
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Meeting Controls */}
                  <div className="mt-auto flex justify-between items-center">
                    <div className="flex space-x-3">
                      <button className="bg-plum-600 text-white p-2 rounded-lg hover:bg-plum-700">
                        <Mic className="w-5 h-5" />
                      </button>
                      <button className="bg-plum-600 text-white p-2 rounded-lg hover:bg-plum-700">
                        <Users className="w-5 h-5" />
                      </button>
                    </div>
                    <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                      End Meeting
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[#2D1B2E] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Everything You Need For Efficient Meetings
            </h2>
            <p className="text-gray-400">
              Powerful features designed to transform your office meetings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-[#1D1321] p-6 rounded-xl hover:transform hover:scale-105 transition-all duration-300">
                <div className="w-12 h-12 bg-plum-500/10 rounded-lg flex items-center justify-center text-plum-400 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Creators Section */}
      <section className="py-20 bg-[#1a1f2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Meet the Creators
            </h2>
            <p className="text-gray-400">
              The visionary minds behind your AI-powered smartrecorder
            </p>
          </div>

          <div className="flex justify-center space-x-12">
            {creators.map((creator, index) => (
              <div
                key={index}
                className="text-center p-8 bg-[#14171F] rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105"
              >
                <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-blue-500/30">
                  <Image
                    src={creator.photo}
                    alt={creator.name}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {creator.name}
                </h3>
                <p className="text-gray-400 mb-4">
                  {creator.role}
                </p>
                <a
                  href={creator.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Linkedin className="w-6 h-6 mr-2" />
                  Connect on LinkedIn
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 p-12 rounded-2xl 
                         border border-blue-500/20 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-gray-400 mb-8">
              Join today and experience the .
            </p>
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-blue-500 text-white rounded-xl text-lg font-medium 
                       hover:bg-blue-600 transition-all duration-300 
                       shadow-lg shadow-blue-500/25"
            >
              Get Started For Free
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage