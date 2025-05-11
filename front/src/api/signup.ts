import axios from "axios";
import api from "./axiosConfig";

interface SignupPayload {
  email: string;
  password: string;
  confirmPassword?: string;
  role: string;
  fullName: string;
  phone: string;
}

export const signupUser = async (payload: SignupPayload) => {
  const response = await api.post("/auth/signup", {
    email: payload.email,
    password: payload.password,
    role: payload.role,
    fullName: payload.fullName,
    phone: payload.phone,
  });

  // If there's a token in the response (immediate login), store refresh token too
  if (response.data.user && response.data.refresh_token) {
    localStorage.setItem("refreshToken", response.data.refresh_token);
  }

  return response.data;
};

export const signupWithGoogle = async () => {
  try {
    // For these non-authenticated requests, we don't need to use the api instance
    const response = await axios.post("http://localhost:8787/auth/login/google", {
      isSignup: true
    });
    return response.data;
  } catch (error) {
    console.error("Google signup error:", error);
    throw error;
  }
};

export const signupWithFacebook = async () => {
  try {
    // For these non-authenticated requests, we don't need to use the api instance
    const response = await axios.post("http://localhost:8787/auth/login/facebook");
    return response.data;
  } catch (error) {
    console.error("Facebook signup error:", error);
    throw error;
  }
};
