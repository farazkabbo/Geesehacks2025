'use client'

import { SignUp } from '@clerk/nextjs'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const SignUpPage = () => {
  const { isSignedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard')
    }
  }, [isSignedIn, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#14171F]">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-[#1E2330] border border-gray-800",
            formButtonPrimary: "bg-blue-500 hover:bg-blue-400",
            formFieldInput: "bg-[#14171F] border-gray-700 text-gray-300",
            footerActionLink: "text-blue-300 hover:text-blue-200",
            formFieldLabel: "text-gray-300",
          }
        }}
        redirectUrl="/dashboard"
        path="/signup"
        signInUrl="/sign-in"   // Make sure this matches the path in SignInPage
      />
    </div> 
  )
}

export default SignUpPage