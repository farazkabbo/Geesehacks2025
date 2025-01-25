// src/app/layout.tsx
'use client'

import { ClerkProvider } from '@clerk/nextjs'

//import { AppStateProvider } from '@/context/AppStateContext'
//import Header from '@/components/layout/Header'


import localFont from "next/font/local"
import { usePathname } from 'next/navigation'
import "./globals.css"
import Header from './components/layout/Header'

// Font setup
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname()

  // List of routes where header should not appear
  const noHeaderRoutes = [
    '/dashboard',
    '/classroom',
    '/favourites',
    '/recordings',
    '/trash',
    '/profile-settings',
    '/notifications-settings',
    '/help-and-support',
    '/account-settings',
    // Add any other dashboard-related routes
  ]

  // Check if current path starts with any of the noHeaderRoutes
  const shouldShowHeader = !noHeaderRoutes.some(route => 
    pathname?.startsWith(route)
  )

  return (
    <html lang="en">
      <ClerkProvider>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#14171F]`}>
          
            {shouldShowHeader && <Header />}
            <main className={`flex min-h-screen flex-col ${shouldShowHeader ? 'pt-20' : ''}`}>
              {children}
            </main>
        
        </body>
      </ClerkProvider>
    </html>
  )
}