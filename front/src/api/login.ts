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
}

export const loginUser = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await axios.post("http://localhost:8787/auth/login", {
    email: payload.email,
    password: payload.password,
  });

  return response.data;
};
