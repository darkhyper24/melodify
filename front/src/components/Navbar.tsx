'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ProfileDropdown from './ProfileDropdown';

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      try {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('access_token') || localStorage.getItem('token');
          setIsAuthenticated(!!token);
          
          // If authenticated, fetch avatar
          if (token) {
            fetchAvatar(token);
          } else {
            setAvatarUrl(null);
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
    
    window.addEventListener("storage", checkAuth);
    window.addEventListener("auth-change", checkAuth);
    
    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("auth-change", checkAuth);
    };
  }, []);
  
  const fetchAvatar = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8787/home', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch avatar');
      }
      
      const data = await response.json();
      setAvatarUrl(data.avatarUrl);
    } catch (error) {
      console.error('Error fetching avatar:', error);
      setAvatarUrl(null);
    }
  };

  return (
    <nav className="bg-black/90 fixed w-full top-0 right-0 py-4 z-40">
      <div className="flex items-center w-full px-8 box-border max-md:px-4">
        <Link href="/" className="text-white text-2xl font-bold mr-auto font-sans">
          Melodify
        </Link>

        <div className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-xl flex justify-center">
          <input
            type="text"
            placeholder="What do you want to listen to?"
            className="w-full px-8 py-4 rounded-full bg-[#242424] text-white text-sm font-normal placeholder-[#909090] outline-none focus:bg-[#2a2a2a] transition-all duration-200"
          />
        </div>

        <div className="flex items-center gap-2 max-md:gap-4">
          {!isAuthenticated ? (
            <>
              <Link
                href="/signup"
                className="text-[#a7a7a7] bg-transparent px-6 py-2 rounded-full font-bold transition-all duration-200 hover:text-white hover:scale-105 text-sm"
              >
                Sign up
              </Link>
              <Link
                href="/login"
                className="text-black bg-white px-6 py-3 rounded-full font-bold transition-all duration-200 hover:bg-[#F0F0F0] hover:scale-105 text-sm"
              >
                Log in
              </Link>
            </>
          ) : (
            <ProfileDropdown setIsAuthenticated={setIsAuthenticated} avatarUrl={avatarUrl} />
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;