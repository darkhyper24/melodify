import axios from "axios";

export interface ProfileData {
  fullName?: string;
  bio?: string;
  phone?: string;
}

export interface ProfileResponse {
  profile?: {
    fullName: string;
    phone: string | null;
    email: string;
    avatarUrl: string | null;
    bio: string | null;
  };
  error?: string;
}

export interface UpdateProfileResponse {
  message?: string;
  updated?: {
    fullName?: string;
    bio?: string;
    phone?: string;
  };
  error?: string;
}

export interface UploadAvatarResponse {
  message?: string;
  avatarUrl?: string;
  error?: string;
}

export const getProfile = async (): Promise<ProfileResponse> => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    
    if (!token) {
      console.error("No authentication token found");
      return { error: "Not authenticated" };
    }
    
    const response = await axios.get("http://localhost:8787/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log("Profile data fetched successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching profile:", error.response?.data || error.message);
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem("token");
      }
      return { error: "Session expired. Please log in again." };
    }
    return { 
      error: error.response?.data?.error || "Failed to fetch profile" 
    };
  }
};

export const updateProfile = async (profileData: ProfileData): Promise<UpdateProfileResponse> => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    
    if (!token) {
      return { error: "Not authenticated" };
    }
    
    const response = await axios.patch(
      "http://localhost:8787/profile/update",
      profileData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error("Error updating profile:", error.response?.data || error.message);
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem("token");
      }
      return { error: "Session expired. Please log in again." };
    }
    return { 
      error: error.response?.data?.error || "Failed to update profile" 
    };
  }
};

export const uploadAvatar = async (file: File): Promise<UploadAvatarResponse> => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    
    if (!token) {
      return { error: "Not authenticated" };
    }
    
    const formData = new FormData();
    formData.append("avatar", file);
    
    const response = await axios.post(
      "http://localhost:8787/profile/upload",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error("Error uploading avatar:", error.response?.data || error.message);
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem("token");
      }
      return { error: "Session expired. Please log in again." };
    }
    return { 
      error: error.response?.data?.error || "Failed to upload avatar" 
    };
  }
};
