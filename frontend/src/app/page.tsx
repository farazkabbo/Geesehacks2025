'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import LandingPage from '@/app/components/landing/LandingPage';

export default function Home() {
  // Initialize our authentication hook
  const { isLoaded, isSignedIn } = useAuth();

  // Add a state to handle loading states more gracefully
  const [isLoading, setIsLoading] = useState(true);

  // Use useEffect to set loading state when authentication is loaded
  useEffect(() => {
    if (isLoaded) {
      setIsLoading(false);
    }
  }, [isLoaded]);

  // Create a reusable loading component for better UX
  const LoadingScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#14171F]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-plum-400 mb-4"></div>
      <div className="text-white text-lg font-medium">Loading...</div>
    </div>
  );

  // Handle loading state
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show the landing page regardless of the user's sign-in status
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
