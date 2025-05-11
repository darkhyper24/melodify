"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const Home = () => {
    const router = useRouter();
    const [, setIsAuthenticated] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            setIsAuthenticated(!!token);

            // For authenticated users, redirect based on their role
            if (token) {
                const userRole = localStorage.getItem("userRole");
                if (userRole === "artist") {
                    router.push("/artist/home");
                } else if (userRole === "user") {
                    router.push("/user/home");
                } else {
                    // If no valid role but token exists, default to user home
                    router.push("/user/home");
                }
            } else {
                // For unauthenticated users, redirect to user home
                router.push("/user/home");
            }
        }
    }, [router]);
    
    // Return empty component while redirection is happening
    return <></>;
};

export default Home;
