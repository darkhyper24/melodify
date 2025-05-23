"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import ProfileDropdown from "./ProfileDropdown";
import { useSearch } from "@/hooks/useSearch";

const Navbar = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authChecked, setAuthChecked] = useState(false); // New state to track auth check completion
    const [userRole, setUserRole] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const { searchQuery, handleSearchChange, handleSearchSubmit } = useSearch();

    useEffect(() => {
        const checkAuth = () => {
            try {
                if (typeof window !== "undefined") {
                    const token = localStorage.getItem("token");
                    setIsAuthenticated(!!token);
                    setUserRole(localStorage.getItem("userRole"));
                    if (token) {
                        fetchAvatar(token);
                    } else {
                        setAvatarUrl(null);
                    }
                }
            } catch (error) {
                console.error("Error checking authentication:", error);
                setIsAuthenticated(false);
            } finally {
                setAuthChecked(true); // Mark auth check as done
            }
        };

        checkAuth();

        window.addEventListener("storage", checkAuth);
        window.addEventListener("auth-change", checkAuth);

        return () => {
            window.removeEventListener("storage", checkAuth);
            window.removeEventListener("auth-change", checkAuth);
        };
    }, []);

    const fetchAvatar = async (token: string) => {
        try {
            const response = await fetch("http://localhost:8787/home", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch avatar");
            }

            const data = await response.json();
            setAvatarUrl(data.avatarUrl);
        } catch (error) {
            console.error("Error fetching avatar:", error);
            setAvatarUrl(null);
        }
    };

    return (
        <nav className="bg-black/90 sticky w-full top-0 right-0 py-4 z-40">
            <div className="flex items-center w-full px-8 box-border max-md:px-4">
                {userRole === "artist" ? (
                    <Link href="/artist/home" className="mr-auto">
                        <Image
                            src="/logo.png"
                            alt="Melodify Logo"
                            width={130}
                            height={40}
                            className="object-contain"
                        />
                    </Link>
                ) : (
                    <Link href="/user/home" className="mr-auto">
                        <Image
                            src="/logo.png"
                            alt="Melodify Logo"
                            width={130}
                            height={40}
                            className="object-contain"
                        />
                    </Link>
                )}

                <div className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-xl flex justify-center">
                    <form onSubmit={handleSearchSubmit} className="w-full">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="What do you want to listen to?"
                            className="w-full px-8 py-4 rounded-full bg-[#242424] text-white text-sm font-normal placeholder-[#909090] outline-none focus:bg-[#2a2a2a] transition-all duration-200"
                        />
                    </form>
                </div>

                <div className="flex items-center gap-2 max-md:gap-4">
                    {authChecked && (
                        isAuthenticated ? (
                            <ProfileDropdown setIsAuthenticated={setIsAuthenticated} avatarUrl={avatarUrl} />
                        ) : (
                            <>
                                <Link
                                    href="/signup"
                                    className="text-[#a7a7a7] bg-transparent px-6 py-2 rounded-full font-bold transition-all duration-200 hover:text-white hover:scale-105 text-sm"
                                >
                                    Sign up
                                </Link>
                                <Link
                                    href="/login"
                                    className="text-black bg-white px-6 py-3 rounded-full font-bold transition-all duration-200 hover:bg-[#F0F0F0] hover:scale-105 text-sm"
                                >
                                    Log in
                                </Link>
                            </>
                        )
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
