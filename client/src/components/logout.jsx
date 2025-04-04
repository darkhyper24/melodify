import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { handleLogout } from './logoutFunctionality';

const Logout = () => {
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    React.useEffect(() => {
      handleLogout(() => setMessage("Logged out successfully"));
      navigate('/signup');
    }, [navigate]);

    return (
        <div>
            <h2>Logout</h2>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Logout;
