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

            if (!token) {
                router.push("/login");
            } else {
                const userRole = localStorage.getItem("userRole");
                if (userRole === "artist") {
                    router.push("/artist/home");
                } else if (userRole === "user") {
                    router.push("/user/home");
                } else {
                    router.push("/login");
                }
            }
        }
    }, [router]);
    return <></>;
};

export default Home;
