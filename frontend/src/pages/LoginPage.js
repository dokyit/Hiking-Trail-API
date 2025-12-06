import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import API_URL from "../config";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password,
      });

      // Store token in localStorage
      localStorage.setItem('token', response.data.access_token);

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      setError(
        error.response?.data?.message || "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0f7f0',
      backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        width: '100%',
        maxWidth: '400px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{
            color: '#2c5f2d',
            fontSize: '32px',
            fontWeight: '600',
            margin: '0 0 10px 0'
          }}>
            🥾 Trail Finder
          </h1>
          <h2 style={{
            color: '#555',
            fontSize: '20px',
            fontWeight: '400',
            margin: 0
          }}>
            Welcome Back
          </h2>
        </div>

        {error && (
          <div style={{
            padding: '12px',
            marginBottom: '20px',
            backgroundColor: '#f8d7da',
            border: '1px solid #dc3545',
            borderRadius: '8px',
            color: '#721c24',
            fontSize: '14px',
          }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontSize: '14px',
              fontWeight: '500',
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = '#2c5f2d'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontSize: '14px',
              fontWeight: '500',
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = '#2c5f2d'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading ? '#999' : '#2c5f2d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#1e4620';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#2c5f2d';
            }}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#666',
        }}>
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{
              color: '#2c5f2d',
              textDecoration: 'none',
              fontWeight: '600',
            }}
            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
