"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getProfile, updateProfile, uploadAvatar } from "@/api/profile";
import type { ProfileResponse, UpdateProfileResponse } from "@/api/profile";

const ProfilePage = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    bio: "",
  });

  // Fetch profile data
  const { data: profileData, isLoading, refetch } = useQuery<ProfileResponse>({
    queryKey: ["profile"],
    queryFn: getProfile,
    retry: false,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);
  
  useEffect(() => {
    if (profileData?.error === 'Not authenticated' || profileData?.error === 'Session expired. Please log in again.') {
      router.push('/login');
    }
  }, [profileData, router]);

  useEffect(() => {
    if (profileData?.profile) {
      setFormData({
        fullName: profileData.profile.fullName || "",
        phone: profileData.profile.phone || "",
        bio: profileData.profile.bio || "",
      });
    }
  }, [profileData]);

  const updateProfileMutation = useMutation<UpdateProfileResponse, Error, typeof formData>({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      if (data.error) {
        setMessage(data.error);
        setMessageType("error");
      } else {
        setMessage("Profile updated successfully");
        setMessageType("success");
        setIsEditing(false);
        refetch();
      }
    },
    onError: () => {
      setMessage("Failed to update profile");
      setMessageType("error");
    },
  });


  const uploadAvatarMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (data) => {
      if (data.error) {
        setMessage(data.error);
        setMessageType("error");
      } else {
        setMessage("Avatar uploaded successfully");
        setMessageType("success");
        refetch();
      }
    },
    onError: () => {
      setMessage("Failed to upload avatar");
      setMessageType("error");
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAvatarMutation.mutate(file);
    }
  };

  const handleCancel = () => {
    if (profileData?.profile) {
      setFormData({
        fullName: profileData.profile.fullName || "",
        phone: profileData.profile.phone || "",
        bio: profileData.profile.bio || "",
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1ed760]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <button 
            className="relative group mb-6 border-0 bg-transparent p-0"
            onClick={handleAvatarClick}
            onKeyDown={(e) => e.key === 'Enter' && handleAvatarClick()}
            aria-label="Change profile picture"
          >
            <div className="w-40 h-40 rounded-full overflow-hidden bg-[#282828] flex items-center justify-center">
              {profileData?.profile?.avatarUrl ? (
                <img 
                  src={profileData.profile.avatarUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  className="w-20 h-20 text-[#535353]"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
              )}
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="text-white text-sm font-medium">Change photo</span>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
          </button>

          <h1 className="text-3xl font-bold mb-2">
            {profileData?.profile?.fullName || "Your Profile"}
          </h1>
          <p className="text-[#b3b3b3]">{profileData?.profile?.email}</p>
        </div>

        {message && (
          <div 
            className={`mb-6 p-4 rounded ${
              messageType === "success" 
                ? "bg-[rgba(30,215,96,0.1)] text-[#1ed760]" 
                : "bg-[rgba(255,0,0,0.1)] text-red-500"
            }`}
          >
            {message}
          </div>
        )}

        <div className="bg-[#181818] rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Profile</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="text-white bg-transparent border border-[#535353] px-4 py-2 rounded-full text-sm font-bold hover:border-white transition-colors"
              >
                Edit profile
              </button>
            ) : null}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-[#b3b3b3] mb-2">
                  Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-[#3E3E3E] border-none rounded text-white focus:outline-none focus:ring-2 focus:ring-[#1ed760]"
                    placeholder="Your name"
                  />
                ) : (
                  <p className="text-white">{profileData?.profile?.fullName || "Not set"}</p>
                )}
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-[#b3b3b3] mb-2">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio || ""}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-3 bg-[#3E3E3E] border-none rounded text-white focus:outline-none focus:ring-2 focus:ring-[#1ed760]"
                    placeholder="Tell us about yourself"
                  />
                ) : (
                  <p className="text-white">{profileData?.profile?.bio || "Not set"}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[#b3b3b3] mb-2">
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-[#3E3E3E] border-none rounded text-white focus:outline-none focus:ring-2 focus:ring-[#1ed760]"
                    placeholder="Your phone number"
                  />
                ) : (
                  <p className="text-white">{profileData?.profile?.phone || "Not set"}</p>
                )}
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 bg-transparent border border-[#535353] rounded-full text-white font-bold hover:border-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className={`px-6 py-3 bg-[#1ed760] text-black rounded-full font-bold hover:bg-[#1fdf64] transition-colors ${
                      updateProfileMutation.isPending ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save profile"}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
