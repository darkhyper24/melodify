"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/api/user";
import api from "@/api/axiosConfig";

export default function AuthRedirect() {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAuthAndRedirect = async () => {
            try {
                // Check if user is authenticated
                const token = localStorage.getItem("token");
                const refreshToken = localStorage.getItem("refreshToken");
                
                if (!token) {
                    router.push("/login");
                    return;
                }

                // Get user role
                const userResponse = await getCurrentUser();
                if (userResponse.error) {
                    // If there's an error even after potential token refresh, redirect to login
                    if (!refreshToken) {
                        localStorage.removeItem("token");
                        router.push("/login");
                        return;
                    }
                }

                // Redirect based on role
                if (userResponse.user?.role === "artist") {
                    router.push("/artist/home");
                } else {
                    router.push("/user/home");
                }
            } catch (error) {
                console.error("Error during authentication check:", error);
                router.push("/login");
            } finally {
                setIsChecking(false);
            }
        };

        checkAuthAndRedirect();
    }, [router]);

    return (
        <div className="h-screen w-full flex items-center justify-center bg-black text-white">
            {isChecking && (
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-t-4 border-[#1ed760] border-solid rounded-full animate-spin mb-4"></div>
                    <p className="text-xl">Redirecting...</p>
                </div>
            )}
        </div>
    );
}
