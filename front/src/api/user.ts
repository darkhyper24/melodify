import api from './axiosConfig';

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
    
    const response = await api.get("/auth/me");
    
    return response.data;
  } catch (error: any) {
    console.error("Error fetching user data:", error.response?.data || error.message);
    // Token refresh is handled by axios interceptors
    return { 
      error: error.response?.data?.error || "Failed to fetch user data" 
    };
  }
};
