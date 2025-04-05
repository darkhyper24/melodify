"use client"

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Styles/login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8787/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data.session) {
        localStorage.setItem('token', data.session.access_token);
        setMessage("Login successful")
        navigate('/');
        window.location.reload(); // Force navbar to update
      } else {
        setMessage(data.error || "Login failed")
      }
    } catch (error) {
      setMessage('Error connecting to server');
      console.error(error);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8787/auth/login/google";
  };

  const handleFacebookLogin = () => {
    window.location.href = "http://localhost:8787/auth/login/facebook";
  };

  return (
    <div className="login-container">
      <h1>Log in to Melodify</h1>
      {message && <div className="message">{message}</div>}
      <div className="social-login">
        <button onClick={handleGoogleLogin} className="google-btn">
          <img src="https://accounts.scdn.co/sso/images/new-google-icon.72fd940a229bc94cf9484a3320b3dccb.svg" alt="Google" />
          <span>Continue with Google</span>
        </button>
        <button onClick={handleFacebookLogin} className="facebook-btn">
          <img src="https://accounts.scdn.co/sso/images/new-facebook-icon.eae8e1b6256f7ccf01cf81913254e70b.svg" alt="Facebook" />
          <span>Continue with Facebook</span>
        </button>
      </div>
      <div className="divider">
        <span>or</span>
      </div>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-btn">
          Log In
        </button>
      </form>
      <div className="signup-prompt">
        <p>Don't have an account? <Link to="/signup" className="signup-link">Sign up for Melodify</Link></p>
      </div>
    </div>
  );
};

export default Login;
