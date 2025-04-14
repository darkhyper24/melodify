import axios from "axios";

export interface UserData {
  id: string;
  role: string;
  email: string;
}

export interface UserResponse {
  user?: UserData;
  error?: string;
}

/**
 * Get the current user's role information
 */
export const getCurrentUser = async (): Promise<UserResponse> => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    
    if (!token) {
      console.error("No authentication token found");
      return { error: "Not authenticated" };
    }
    
    const response = await axios.get("http://localhost:8787/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return response.data;
  } catch (error: any) {
    console.error("Error fetching user data:", error.response?.data || error.message);
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem("token");
      }
      return { error: "Session expired. Please log in again." };
    }
    return { 
      error: error.response?.data?.error || "Failed to fetch user data" 
    };
  }
};
