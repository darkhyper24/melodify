"use client"

import { useState } from "react";
import '../Styles/signup.css';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");

  const handleNext = (e) => {
    e.preventDefault();
    if (email) {
      setStep(2);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8787/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, fullName }),
      });
      const data = await response.json();
      setMessage(data.message || data.error || "Signup complete")
    } catch (error) {
      setMessage("Error connecting to server")
      console.error(error)
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = "http://localhost:8787/auth/login/google";
  };

  const handleFacebookSignup = () => {
    window.location.href = "http://localhost:8787/auth/login/facebook";
  };
  return (

      <div className="signup-container">
        <h1>Sign up to start listening</h1>
        {step === 1 ? (
          <form onSubmit={handleNext}>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                required
              />
            </div>
            <button type="submit" className="next-btn">
              Next
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label htmlFor="password">Create a password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            <button type="submit" className="signup-btn">
              Sign up
            </button>
          </form>
        )}
        {message && <div className="message">{message}</div>}
        <div className="divider">
          <span>or</span>
        </div>
        <div className="social-signup">
          <button onClick={handleGoogleSignup} className="google-btn">
            <img src="https://accounts.scdn.co/sso/images/new-google-icon.72fd940a229bc94cf9484a3320b3dccb.svg" alt="Google" />
            <span>Sign up with Google</span>
          </button>
          <button onClick={handleFacebookSignup} className="facebook-btn">
            <img src="https://accounts.scdn.co/sso/images/new-facebook-icon.eae8e1b6256f7ccf01cf81913254e70b.svg" alt="Facebook" />
            <span>Sign up with Facebook</span>
          </button>
        </div>
        <div className="login-link">
          <p>
            Already have an account? <a href="/login">Log in here</a>.
          </p>
        </div>
      </div>
  );
};

export default Signup;
