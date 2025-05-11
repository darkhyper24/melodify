import api from "./axiosConfig";
import axios from "axios";

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse {
  message?: string;
  session?: {
    access_token: string;
  };
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  user?: {
    id: string;
    email: string;
    role: string;
  };
  error?: string;
  url?: string; // For OAuth redirects
}

export const loginUser = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await api.post("/auth/login", {
    email: payload.email,
    password: payload.password,
  });

  // Store refresh token if available
  if (response.data.refresh_token) {
    localStorage.setItem("refreshToken", response.data.refresh_token);
  }

  return response.data;
};

export const loginWithGoogle = async (): Promise<LoginResponse> => {
  try {
    // For these non-authenticated requests, we don't need to use the api instance
    const response = await axios.post("http://localhost:8787/auth/login/google", {
      isSignup: false
    });
    return response.data;
  } catch (error) {
    console.error("Google login error:", error);
    throw error;
  }
};

export const loginWithFacebook = async (): Promise<LoginResponse> => {
  try {
    // For these non-authenticated requests, we don't need to use the api instance
    const response = await axios.post("http://localhost:8787/auth/login/facebook");
    return response.data;
  } catch (error) {
    console.error("Facebook login error:", error);
    throw error;
  }
};
