'use client'

import { SignIn } from '@clerk/nextjs';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const SignInPage = () => {
 const { isSignedIn } = useAuth();
 const router = useRouter();

 useEffect(() => {
   if (isSignedIn) {
     router.push('/');
   }
 }, [isSignedIn, router]);

 return (
   <div className="flex items-center justify-center min-h-screen bg-[#14171F]">
     <SignIn
       appearance={{
         elements: {
           rootBox: "mx-auto",
           card: "bg-[#1a1f2e] text-white rounded-lg",
           headerTitle: "text-white",
           headerSubtitle: "text-gray-400",
           socialButtonsBlockButton: "bg-[#2c3444] text-white hover:bg-[#3c4454]",
           socialButtonsBlockButtonText: "text-white",
           formFieldLabel: "text-gray-300",
           formFieldInput: "bg-[#14171F] border-gray-700 text-white focus:border-blue-500",
           submitButton: "bg-blue-500 hover:bg-blue-600",
           footerActionLink: "text-blue-400 hover:text-blue-300"
         }
       }}
  
       path="/sign-in"
       signUpUrl="/signup"
     />
   </div>
 );
};

export default SignInPage;