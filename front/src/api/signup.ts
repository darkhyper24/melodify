import axios from "axios";

interface SignupPayload {
  email: string;
  password: string;
  confirmPassword?: string;
  role: string;
  fullName: string;
  phoneNumber: string;
}

export const signupUser = async (payload: SignupPayload) => {
  const response = await axios.post("http://localhost:8787/auth/signup", {
    email: payload.email,
    password: payload.password,
    role: payload.role,
    fullName: payload.fullName,
    phoneNumber: payload.phoneNumber,
  });

  return response.data;
};
