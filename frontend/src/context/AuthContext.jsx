import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('vivora_token');
    const savedUser = localStorage.getItem('vivora_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('vivora_token');
        localStorage.removeItem('vivora_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: jwtToken, user: userData } = res.data;
      
      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem('vivora_token', jwtToken);
      localStorage.setItem('vivora_user', JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check credentials.'
      };
    }
  };

  const loginDemo = () => {
    const randomId = Math.floor(Math.random() * 1000) + 10;
    const demoUser = {
      id: randomId,
      name: 'demo.candidate',
      email: 'demo.candidate@vivora.ai',
      role: 'candidate'
    };
    const demoToken = 'demo_token_' + Date.now();

    setToken(demoToken);
    setUser(demoUser);
    localStorage.setItem('vivora_token', demoToken);
    localStorage.setItem('vivora_user', JSON.stringify(demoUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('vivora_token');
    localStorage.removeItem('vivora_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, isLoading, login, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
