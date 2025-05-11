export const handleLogout = async (setIsAuthenticated: (v: boolean) => void, navigate: (path: string) => void) => {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            console.log("No active session found");
            return;
        }

        const response = await fetch("http://localhost:8787/auth/logout", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            localStorage.removeItem("userRole");

            setIsAuthenticated(false);

            window.dispatchEvent(new Event("auth-change"));

            console.log("Logged out successfully");
            navigate("/login");
        } else {
            const data = await response.json();
            console.log(data.error || "Logout failed");
        }
    } catch (err) {
        console.error(err);
    }
};
