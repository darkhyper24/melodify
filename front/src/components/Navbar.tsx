'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { handleLogout } from './logout';

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  return (
    <nav className="bg-black/90 fixed w-full top-0 right-0 overflow-hidden py-4 z-50">
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
            <button
              onClick={() => handleLogout(setIsAuthenticated, router.push)}
              className="text-[#a7a7a7] px-8 py-2 rounded-full border border-[#a7a7a7] font-bold transition-all duration-200 hover:text-[#1ed760] hover:border-[#1ed760] hover:scale-105 text-sm"
            >
              Log out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
