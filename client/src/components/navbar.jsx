import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { handleLogout } from './logoutFunctionality';
import '../Styles/navbar.css';

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
        <span>Melodify</span>
        </Link>
        <div className="nav-searchbar">
          <input className='nav-search' type="text" placeholder="What do you want to listen to?" />
        </div>
        <div className="nav-links">
          {!isAuthenticated ? (
            <>
              <Link to="/signup" className="nav-link signup">Sign up</Link>
              <Link to="/login" className="nav-link login">Log in</Link>
            </>
          ) : (
            <button 
              onClick={() => handleLogout(setIsAuthenticated, navigate)} 
              className="nav-link logout"
            >
              Log out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
