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
  const response = await axios.post("http://localhost:8787/auth/login", {
    email: payload.email,
    password: payload.password,
  });

  return response.data;
};

export const loginWithGoogle = async (): Promise<LoginResponse> => {
  try {
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
    const response = await axios.post("http://localhost:8787/auth/login/facebook");
    return response.data;
  } catch (error) {
    console.error("Facebook login error:", error);
    throw error;
  }
};
