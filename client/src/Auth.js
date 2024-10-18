// src/components/Auth.js
import React, { useState, useEffect } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { app } from './firebase';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Auth.css';

const Auth = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        onLogin(user);
      }
    });

    return () => unsubscribe();
  }, [auth, onLogin]);

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError("Passwords don't match. Please try again.");
        return;
      }
      if (!validatePassword(password)) {
        setError("Password must be at least 8 characters long, contain a number, and a special character.");
        return;
      }
    }

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      handleAuthError(error);
    }
  };

  const handleAuthError = (error) => {
    switch (error.code) {
      case 'auth/email-already-in-use':
        setError('This email is already registered. Please use a different email or try logging in.');
        break;
      case 'auth/invalid-email':
        setError('Invalid email address. Please check and try again.');
        break;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        setError('Invalid email or password. Please check your credentials and try again.');
        break;
      case 'auth/weak-password':
        setError('Password is too weak. Please choose a stronger password.');
        break;
      case 'auth/network-request-failed':
        setError('Network error. Please check your internet connection and try again.');
        break;
      case 'auth/too-many-requests':
        setError('Too many failed login attempts. Please try again later or reset your password.');
        break;
      default:
        setError('Account not found. Please Sign Up.');
        console.error('Authentication error:', error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>{isSignUp ? 'Sign Up' : 'Login'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          </div>
          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
            <button 
              type="button" 
              className="show-password-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {isSignUp && (
            <div className="input-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                required
              />
              <button 
                type="button" 
                className="show-password-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          )}
          <button type="submit" className="auth-submit-btn">
            {isSignUp ? 'Sign Up' : 'Login'}
          </button>
        </form>
        <button className="auth-toggle" onClick={() => {
          setIsSignUp(!isSignUp);
          setError(null);
          setPassword('');
          setConfirmPassword('');
        }}>
          {isSignUp ? 'Switch to Login' : 'Switch to Sign Up'}
        </button>
        {error && <p className="auth-error">{error}</p>}
        {isSignUp && (
          <p className="password-rules">
            Password must be at least 8 characters long, contain a number, and a special character.
          </p>
        )}
      </div>
    </div>
  );
};

export default Auth;