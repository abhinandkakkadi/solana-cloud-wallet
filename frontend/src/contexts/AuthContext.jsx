import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('authUser');
    
    if (savedToken) {
      if (isTokenExpired(savedToken)) {
        logout();
      } else {
        setToken(savedToken);
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      }
    }
    setLoading(false);
  }, []);

  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:3000/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      const { token: authToken, user: userData } = data;

      setToken(authToken);
      setUser(userData);

      localStorage.setItem('authToken', authToken);
      localStorage.setItem('authUser', JSON.stringify(userData));

      navigate('/dashboard');
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (formData) => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:3000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      const data = await response.json();
      
      const { token: authToken, user: userData } = data;

      setToken(authToken);
      setUser(userData);

      localStorage.setItem('authToken', authToken);
      localStorage.setItem('authUser', JSON.stringify(userData));

      navigate('/dashboard');
      
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    navigate('/user/signin');
  };

  const isAuthenticated = () => {
    return token && !isTokenExpired(token);
  };

  const apiCall = async (url, options = {}) => {
    if (!token || isTokenExpired(token)) {
      logout();
      throw new Error('Authentication required');
    }

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch("http://localhost:3000"+url, defaultOptions);
      
      if (response.status === 401) {
        logout();
        throw new Error('Session expired');
      }

      return response;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    token,
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated,
    apiCall,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};