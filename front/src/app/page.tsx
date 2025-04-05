"use client"

import { BiHome, BiLibrary, BiSearch, BiPlus } from 'react-icons/bi';
import Link from 'next/link';

const Home = () => {
  return (
    <div className="flex h-screen bg-black text-white pt-16">
      {/* Sidebar */}
      <div className="w-[340px] h-full bg-[#121212] flex flex-col gap-2 p-2">
        <div className="bg-[#242424] rounded-lg p-4">
          <Link href="/" className="flex items-center gap-4 p-3 text-[#b3b3b3] font-bold hover:text-white">
            <BiHome className="text-2xl" />
            <span>Home</span>
          </Link>
          <Link href="/search" className="flex items-center gap-4 p-3 text-[#b3b3b3] font-bold hover:text-white">
            <BiSearch className="text-2xl" />
            <span>Search</span>
          </Link>
        </div>

        <div className="flex-1 bg-[#242424] rounded-lg p-4 flex flex-col gap-4">
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-3 text-[#b3b3b3] font-bold">
              <BiLibrary className="text-2xl" />
              <span>Your Library</span>
            </div>
            <button className="bg-none border-none text-[#b3b3b3] text-2xl p-1 opacity-70 hover:opacity-100 hover:text-white">
              <BiPlus />
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-4 px-2">
            <div className="bg-[#242424] rounded-lg p-5">
              <h2 className="text-base mb-2">Create your first playlist</h2>
              <p className="text-[#b3b3b3] text-sm mb-5">It's easy, we'll help you</p>
              <button className="bg-white text-black font-bold text-sm px-8 py-3 rounded-full hover:scale-105 transition-transform">
                Create playlist
              </button>
            </div>

            <div className="bg-[#242424] rounded-lg p-5">
              <h2 className="text-base mb-2">Let's find some podcasts to follow</h2>
              <p className="text-[#b3b3b3] text-sm mb-5">We'll keep you updated on new episodes</p>
              <button className="bg-white text-black font-bold text-sm px-8 py-3 rounded-full hover:scale-105 transition-transform">
                Browse podcasts
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-gradient-to-b from-[#1e1e1e] to-[#121212] overflow-y-auto p-6">
        <div className="max-w-[1955px] mx-auto">
          <section className="mb-10">
            <h1 className="text-3xl mb-6">Good afternoon</h1>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="bg-white/10 rounded-md flex items-center gap-4 p-4 cursor-pointer hover:bg-white/20"
                >
                  <div className="w-20 h-20 bg-[#282828] rounded-md" />
                  <span className="font-bold">Playlist {item}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl mb-5">Made For You</h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] cursor-pointer"
                >
                  <div className="w-full aspect-square bg-[#282828] rounded-md mb-4" />
                  <h3 className="text-base mb-2">Daily Mix {item}</h3>
                  <p className="text-sm text-[#b3b3b3]">Your daily music mix</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Home;
