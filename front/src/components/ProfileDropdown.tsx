'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { handleLogout } from './logout';

interface ProfileDropdownProps {
  setIsAuthenticated: (value: boolean) => void;
}

const ProfileDropdown = ({ setIsAuthenticated }: ProfileDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Get user role if available
  const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') ?? 'user' : 'user';

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAccountClick = () => {
    router.push('/profile');
    setIsOpen(false);
  };

  const handleLogoutClick = () => {
    handleLogout(setIsAuthenticated, (path) => {
      router.push(path);
    });
    setIsOpen(false);
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-[#282828] hover:bg-[#3E3E3E] transition-colors duration-200"
        aria-label="Profile menu"
        aria-expanded={isOpen}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="w-6 h-6 text-white"
        >
          <path 
            fillRule="evenodd" 
            d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" 
            clipRule="evenodd" 
          />
        </svg>
      </button>
      
      {isOpen && (
        <div className="fixed top-[60px] right-8 w-48 bg-[#282828] rounded-md shadow-lg z-[100] py-1 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#3E3E3E]">
            <p className="text-sm text-white font-medium truncate">
              {userRole === 'artist' ? 'Artist Account' : 'User Account'}
            </p>
          </div>
          <button
            onClick={handleAccountClick}
            className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#3E3E3E] transition-colors duration-200"
          >
            Profile
          </button>
          <button
            onClick={handleLogoutClick}
            className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#3E3E3E] transition-colors duration-200"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
