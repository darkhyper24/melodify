import axios from "axios";

interface SignupPayload {
  email: string;
  password: string;
  confirmPassword?: string;
  role: string;
  fullName: string;
  phone: string;
}

export const signupUser = async (payload: SignupPayload) => {
  const response = await axios.post("http://localhost:8787/auth/signup", {
    email: payload.email,
    password: payload.password,
    role: payload.role,
    fullName: payload.fullName,
    phone: payload.phone,
  });

  return response.data;
};

export const signupWithGoogle = async () => {
  try {
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
    const response = await axios.post("http://localhost:8787/auth/login/facebook");
    return response.data;
  } catch (error) {
    console.error("Facebook signup error:", error);
    throw error;
  }
};
