'use client'

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Mic, BookOpen, GraduationCap, Globe, Layers } from 'lucide-react';

const Logo = () => (
  <div className="flex flex-col items-center">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" className="w-10 h-10">
      {/* First curved line */}
      <path
        d="M20 5 
           C30 5, 35 15, 35 20
           C35 25, 30 35, 20 35
           C25 30, 28 25, 28 20
           C28 15, 25 10, 20 5Z"
        fill="#60A5FA"
      />
      {/* Second curved line */}
      <path
        d="M20 5
           C10 5, 5 15, 5 20
           C5 25, 10 35, 20 35
           C15 30, 12 25, 12 20
           C12 15, 15 10, 20 5Z"
        fill="#60A5FA"
      />
    </svg>
  </div>
);

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="w-full fixed top-0 left-0 z-50 border-b border-black bg-black">
      <div className="w-full px-6 sm:px-8 lg:px-10">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-3">
            <Logo />
            <Link href="/" className="text-3xl font-bold text-blue-300 hover:text-blue-200">
              MinuteMaster
            </Link>
          </div>

          <nav className="flex space-x-8">          
            <Link href="/about" className="text-lg text-gray-300 hover:text-white font-medium">
              About
            </Link>
          </nav>

          <div className="flex items-center space-x-6">
            <Link
              href="/sign-in"
              className="text-lg px-6 py-2 text-blue-300 hover:text-white 
                         transition-colors duration-300"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="text-lg px-6 py-2 bg-blue-500 text-white 
                         rounded-md hover:bg-blue-400 
                         transition-colors duration-300"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;