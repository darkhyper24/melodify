"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { loginUser } from '@/api/login';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        // Store user role if available
        if (data.user?.role) {
          localStorage.setItem('userRole', data.user.role);
        }
        
        // Dispatch a custom event to notify other components about the auth change
        window.dispatchEvent(new Event('auth-change'));
        
        setMessage("Login successful");
        // Ensure proper redirection to homepage
        setTimeout(() => {
          router.push('/');
        }, 300);
      } else if (data.error) {
        setMessage(data.error);
      } else {
        setMessage("Login failed");
      }
    },
    onError: (error: any) => {
      setMessage(error.response?.data?.error || 'Error connecting to server');
      console.error(error);
    }
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8787/auth/login/google";
  };

  const handleFacebookLogin = () => {
    window.location.href = "http://localhost:8787/auth/login/facebook";
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
      <div className="w-full max-w-[350px] p-8">
        <h1 className="text-[50px] font-bold mb-12 text-center">Log in to Melodify</h1>
        {message && <div className={`mt-4 p-3 rounded ${message === "Login successful" ? "bg-[rgba(30,215,96,0.1)] text-[#1ed760]" : "bg-[rgba(255,0,0,0.1)] text-red-500"} text-center`}>{message}</div>}

        <div className="flex flex-col gap-2 mb-6">
          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center w-full py-[11px] border border-[#878787] rounded-full text-white font-bold hover:border-white transition"
          >
            <img
              src="https://accounts.scdn.co/sso/images/new-google-icon.72fd940a229bc94cf9484a3320b3dccb.svg"
              alt="Google"
              className="w-6 h-6 mr-3"
            />
            <span>Continue with Google</span>
          </button>
          <button
            onClick={handleFacebookLogin}
            className="flex items-center justify-center w-full py-[11px] border border-[#878787] rounded-full text-white font-bold hover:border-white transition"
          >
            <img
              src="https://accounts.scdn.co/sso/images/new-facebook-icon.eae8e1b6256f7ccf01cf81913254e70b.svg"
              alt="Facebook"
              className="w-6 h-6 mr-3"
            />
            <span>Continue with Facebook</span>
          </button>
        </div>

        <div className="relative text-center my-8">
          <div className="absolute top-1/2 w-[calc(50%-20px)] h-px bg-[#878787] left-0" />
          <div className="absolute top-1/2 w-[calc(50%-20px)] h-px bg-[#878787] right-0" />
          <span className="bg-[#121212] px-4 text-[#878787] text-sm relative z-10">or</span>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label htmlFor="email" className="block mb-2 text-sm font-bold">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="w-full p-3 bg-transparent border border-[#878787] rounded text-white focus:outline-none focus:border-[#1ed760]"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block mb-2 text-sm font-bold">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full p-3 bg-transparent border border-[#878787] rounded text-white focus:outline-none focus:border-[#1ed760]"
            />
            <div className="mt-2 text-right">
              <a href="/passwordrecovery" className="text-sm text-[#1ed760] hover:underline">
                Forgot password?
              </a>
            </div>
          </div>
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className={`w-full py-[14px] mt-6 bg-[#1ed760] text-black rounded-full text-base font-bold hover:bg-[#1fdf64] transition-transform transform hover:scale-105 ${
              loginMutation.isPending ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loginMutation.isPending ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="text-center mt-[10%] text-base">
          <p className="text-[#878787]">
            Don't have an account?{" "}
            <a href="/signup" className="ml-1 text-white font-medium hover:text-[#1ed760] underline">
              Sign up for Melodify
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;