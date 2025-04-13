'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

// Password recovery API function
const recoverPassword = async (data: { email: string; phoneNumber: string }) => {
  const response = await axios.post("http://localhost:8787/auth/recover-password", data);
  return response.data;
};

const PasswordRecoveryPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const recoveryMutation = useMutation({
    mutationFn: recoverPassword,
    onSuccess: (data) => {
      setMessage(data.message || "Recovery email sent. Please check your inbox.");
      setStep(2);
    },
    onError: (error: any) => {
      setMessage(error.response?.data?.error || "Password recovery failed. Please try again.");
      console.error(error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      // First step validation - just email
      if (email) {
        setStep(2);
      }
    } else {
      // Second step - submit both email and phone number
      recoveryMutation.mutate({ email, phoneNumber });
    }
  };

  const handleBackToLogin = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white flex items-start justify-center pt-[100px] px-4">
      <div className="w-full max-w-[350px] p-8">
        <h1 className="text-[50px] font-bold mb-12 text-center">Reset your password</h1>

        {step === 1 ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block mb-2 text-sm font-bold">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
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
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <p className="text-sm mb-4">
                To verify your identity, please enter the phone number associated with your account.
              </p>
              <label htmlFor="phoneNumber" className="block mb-2 text-sm font-bold">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                required
                className="w-full p-3 border border-[#878787] rounded bg-transparent text-white text-base focus:outline-none focus:border-white"
              />
            </div>
            <button
              type="submit"
              disabled={recoveryMutation.isPending}
              className={`w-full py-3 bg-[#1ed760] text-black font-bold rounded-full text-base hover:bg-[#1fdf64] hover:scale-[1.04] transition ${
                recoveryMutation.isPending ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {recoveryMutation.isPending ? "Processing..." : "Reset Password"}
            </button>
          </form>
        )}

        {message && (
          <div className={`mt-4 p-3 rounded ${
            message.includes("sent") 
              ? "bg-[rgba(30,215,96,0.1)] text-[#1ed760]" 
              : "bg-[rgba(255,0,0,0.1)] text-red-500"
          } text-center`}>
            {message}
          </div>
        )}

        <div className="text-center mt-8">
          <button
            onClick={handleBackToLogin}
            className="text-[#1ed760] hover:underline"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordRecoveryPage;