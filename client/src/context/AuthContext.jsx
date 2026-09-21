import React, { createContext, useState, useEffect } from 'react';
import { getCurrentUser, login as apiLogin, register as apiRegister, logout as apiLogout, verifyOtp as apiVerifyOtp, resendOtp as apiResendOtp } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const loginUser = async (email, password) => {
    const data = await apiLogin(email, password);
    setUser(data);
    return data;
  };

  const registerUser = async (userData) => {
    const data = await apiRegister(userData);
    if (data.token) {
      setUser(data);
    }
    return data;
  };

  const verifyOtpUser = async (email, otp) => {
    const data = await apiVerifyOtp(email, otp);
    setUser(data);
    return data;
  };

  const resendOtpUser = async (email) => {
    const data = await apiResendOtp(email);
    return data;
  };

  const logoutUser = () => {
    apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, loginUser, registerUser, logoutUser, verifyOtpUser, resendOtpUser }}>
      {children}
    </AuthContext.Provider>
  );
};
