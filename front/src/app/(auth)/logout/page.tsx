"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { handleLogout } from "@/components/logout";

const LogoutPage = () => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const performLogout = () => {
    setIsLoading(true);
    
    // Check if token exists
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("No active session found");
      setIsLoading(false);
      return;
    }
    
    // Perform logout
    handleLogout(
      () => {}, // setIsAuthenticated parameter
      (path) => {
        setMessage("Logged out successfully");
        setIsLoading(false);
        // Delay navigation to show success message
        setTimeout(() => router.push(path), 1500);
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
      <div className="w-full max-w-[350px] p-8">
        <h1 className="text-[50px] font-bold mb-12 text-center">Log out</h1>
        
        {message && (
          <div className={`mt-4 p-3 rounded ${
            message.includes("successfully") 
              ? "bg-[rgba(30,215,96,0.1)] text-[#1ed760]" 
              : "bg-[rgba(255,0,0,0.1)] text-red-500"
          } text-center`}>
            {message}
          </div>
        )}
        
        <button
          onClick={performLogout}
          disabled={isLoading}
          className="w-full py-[14px] mt-6 bg-[#1ed760] text-black rounded-full text-base font-bold hover:bg-[#1fdf64] transition-transform transform hover:scale-105"
        >
          {isLoading ? "Logging out..." : "Log Out"}
        </button>
        
        <button
          onClick={() => router.push("/")}
          className="w-full py-[14px] mt-6 border border-[#878787] rounded-full text-white font-bold hover:border-white transition"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default LogoutPage;
