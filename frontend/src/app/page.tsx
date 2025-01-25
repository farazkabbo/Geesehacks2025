'use client'

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LandingPage from '@/app/components/landing/LandingPage';

export default function Home() {
  // Initialize our authentication and routing hooks
  const { isLoaded, userId, isSignedIn } = useAuth();
  const router = useRouter();
  
  // Add a state to handle loading states more gracefully
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Use useEffect for navigation to avoid hydration mismatches
  useEffect(() => {
    // Only attempt navigation when auth is loaded and we have a user
    if (isLoaded && isSignedIn) {
      setIsRedirecting(true);
      // Add a small delay to ensure smooth transition
      const redirectTimer = setTimeout(() => {
        router.push('/dashboard');
      }, 100);

      // Cleanup timer if component unmounts
      return () => clearTimeout(redirectTimer);
    }
  }, [isLoaded, isSignedIn, router]);

  // Create a reusable loading component for better UX
  const LoadingScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#14171F]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-plum-400 mb-4"></div>
      <div className="text-white text-lg font-medium">
        {isRedirecting ? 'Redirecting to dashboard...' : 'Loading...'}
      </div>
    </div>
  );

  // Handle different states of the application
  if (!isLoaded || isRedirecting) {
    return <LoadingScreen />;
  }

  // If there's no user, show the landing page
  if (!isSignedIn) {
    try {
      return <LandingPage />;
    } catch (error) {
      // Handle any errors that might occur when rendering the landing page
      console.error('Error rendering landing page:', error);
      return (
        <div className="flex items-center justify-center min-h-screen bg-[#14171F]">
          <div className="text-white text-center">
            <h2 className="text-xl font-medium mb-2">Something went wrong</h2>
            <p className="text-gray-400">Please try refreshing the page</p>
          </div>
        </div>
      );
    }
  }

  // This should never be reached, but TypeScript likes explicit returns
  return <LoadingScreen />;
}