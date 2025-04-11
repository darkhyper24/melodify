'use client'

import { useState } from "react";
import { signupUser, signupWithGoogle, signupWithFacebook } from "@/api/signup";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const Signup = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setStep(2);
    }
  };

  const signupMutation = useMutation({
    mutationFn: signupUser,
    onSuccess: (data) => {
      setMessage(data.message || "Signup complete");
      // Redirect to login page after successful signup
      setTimeout(() => {
        router.push('/login');
      }, 1500); // Short delay to show success message
    },
    onError: (error: any) => {
      setMessage(error.response?.data?.error || "Error connecting to server");
      console.error(error);
    }
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordError("");

    signupMutation.mutate({
      email,
      password,
      fullName,
      role,
      phone
    });
  };

  const handleGoogleSignup = async () => {
    try {
      setMessage("");
      const data = await signupWithGoogle();
      if (data?.url) {
        // Store information that this was a signup so we can redirect to login after OAuth
        localStorage.setItem('googleAuthAction', 'signup');
        localStorage.setItem('redirectAfterAuth', '/login');
        window.location.href = data.url;
      } else {
        setMessage("Error connecting to Google authentication service");
      }
    } catch (error: any) {
      setMessage(error.response?.data?.error || "Error connecting to Google authentication service");
      console.error(error);
    }
  };

  const handleFacebookSignup = async () => {
    try {
      setMessage("");
      const data = await signupWithFacebook();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        setMessage("Error connecting to Facebook authentication service");
      }
    } catch (error: any) {
      setMessage(error.response?.data?.error || "Error connecting to Facebook authentication service");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white flex items-start justify-center pt-[100px] px-4">
      <div className="w-full max-w-[350px] p-8">
        <h1 className="text-[50px] font-bold mb-12 text-center">Sign up to start listening</h1>

        {step === 1 ? (
          <form onSubmit={handleNext}>
            <div className="mb-6">
              <label htmlFor="email" className="block mb-2 text-sm font-bold">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                required
                className="w-full p-3 border border-[#878787] rounded bg-transparent text-white text-base focus:outline-none focus:border-white"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#1ed760] text-black font-bold rounded-full text-base hover:bg-[#1fdf64] hover:scale-[1.04] transition"
            >
              Next
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <div className="mb-6">
              <label htmlFor="password" className="block mb-2 text-sm font-bold">
                Create a password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                autoComplete="new-password"
                className="w-full p-3 border border-[#878787] rounded bg-transparent text-white text-base focus:outline-none focus:border-white"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block mb-2 text-sm font-bold">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                autoComplete="new-password"
                className="w-full p-3 border border-[#878787] rounded bg-transparent text-white text-base focus:outline-none focus:border-white"
              />
              {passwordError && (
                <p className="mt-1 text-red-500 text-sm">{passwordError}</p>
              )}
            </div>
            <div className="mb-6">
              <label htmlFor="fullName" className="block mb-2 text-sm font-bold">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full p-3 border border-[#878787] rounded bg-transparent text-white text-base focus:outline-none focus:border-white"
              />
            </div>
            <div className="mb-6">
  <label htmlFor="role" className="block mb-2 text-sm font-bold text-white">
    Role
  </label>
  <select
    id="role"
    value={role}
    onChange={(e) => setRole(e.target.value)}
    required
    className="appearance-none w-full p-3 border border-[#878787] rounded bg-[#242424] text-white text-base focus:outline-none focus:border-white"
  >
    <option value="" disabled hidden className="text-[#878787]">
      Select your option
    </option>
    <option value="user" className="text-white">
      user
    </option>
    <option value="artist" className="text-white">
      artist
    </option>
  </select>
</div>

            <div className="mb-6">
            <label htmlFor="phone" className="block mb-2 text-sm font-bold">
              Phone Number
            </label>
            <input
  id="phone"
  type="tel"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  placeholder="Enter your phone number"
  required
  className="w-full p-3 border border-[#878787] rounded bg-transparent text-white text-base focus:outline-none focus:border-white"
/>
            </div>
            <button
              type="submit"
              disabled={signupMutation.isPending}
              className={`w-full py-3 bg-[#1ed760] text-black font-bold rounded-full text-base hover:bg-[#1fdf64] hover:scale-[1.04] transition ${signupMutation.isPending ? "opacity-70 cursor-not-allowed" : ""
                }`}
            >
              {signupMutation.isPending ? "Signing up..." : "Sign up"}
            </button>
          </form>
        )}

        {message && (
          <div className={`mt-4 p-3 rounded ${message.includes("successful") || message.includes("complete")
              ? "bg-[rgba(30,215,96,0.1)] text-[#1ed760]"
              : "bg-[rgba(255,0,0,0.1)] text-red-500"
            } text-center`}>
            {message}
          </div>
        )}

        <div className="relative my-8 text-center">
          <hr className="border-[#878787]" />
          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#121212] px-4 text-sm text-[#878787]">
            or
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleGoogleSignup}
            className="flex items-center justify-center gap-3 py-[11px] px-4 border border-[#878787] rounded-full bg-transparent text-white text-base font-bold hover:border-white transition"
          >
            <img
              src="https://accounts.scdn.co/sso/images/new-google-icon.72fd940a229bc94cf9484a3320b3dccb.svg"
              alt="Google"
              className="w-6 h-6"
            />
            <span>Sign up with Google</span>
          </button>
          <button
            onClick={handleFacebookSignup}
            className="flex items-center justify-center gap-3 py-[11px] px-4 border border-[#878787] rounded-full bg-transparent text-white text-base font-bold hover:border-white transition"
          >
            <img
              src="https://accounts.scdn.co/sso/images/new-facebook-icon.eae8e1b6256f7ccf01cf81913254e70b.svg"
              alt="Facebook"
              className="w-6 h-6"
            />
            <span>Sign up with Facebook</span>
          </button>
        </div>

        <div className="text-center mt-8 text-base">
          <p>
            Already have an account?{" "}
            <a href="/login" className="underline hover:text-[#1ed760]">
              Log in here
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
