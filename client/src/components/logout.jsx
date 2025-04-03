import React, { useState } from "react";

const Logout = () => {
    const [message, setMessage] = useState("");

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem("token");
            
            if (!token) {
                setMessage("No active session found");
                return;
            }
            
            const response = await fetch("http://localhost:8787/auth/logout", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            });
            
            if (response.ok) {
                // Clear local storage
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setMessage("Logged out successfully");
            } else {
                const data = await response.json();
                setMessage(data.error || "Logout failed");
            }
        } catch (err) {
            setMessage(`Error: ${err.message}`);
            console.error(err);
        }
    };

    return (
        <div>
            <h2>Logout</h2>
            {message && <p>{message}</p>}
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Logout;

