import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';

export interface UserInfo {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  user: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<{ success: boolean; message: string }>;
  register: (email: string, password: string, fullName: string, role: string) => Promise<{ success: boolean; message: string }>;
  verifyOtp: (email: string, code: string) => Promise<{ success: boolean; message: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyResetOtp: (email: string, code: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  resendOtp: (email: string) => Promise<{ success: boolean; message: string }>;
  checkEmailExists: (email: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    try {
      const response = await api.post('/auth/login', { email, password, rememberMe });
      const data = response.data;

      if (data.succeeded) {
        setToken(data.token);
        setUser(data.userInfo);
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.userInfo));
        localStorage.setItem('userEmail', email);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Đăng nhập thất bại.' };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Email hoặc mật khẩu không chính xác.'
      };
    }
  };

  const register = async (email: string, password: string, fullName: string, role: string) => {
    try {
      const response = await api.post('/auth/register', { email, password, fullName, role });
      const data = response.data;
      if (data.succeeded) {
        localStorage.setItem('userEmail', email);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Đăng ký thất bại.' };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Đăng ký thất bại. Email có thể đã được sử dụng.'
      };
    }
  };

  const verifyOtp = async (email: string, code: string) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, code });
      const data = response.data;

      if (data.succeeded) {
        setToken(data.token);
        setUser(data.userInfo);
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.userInfo));
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Mã xác thực không chính xác.' };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Xác thực OTP thất bại.'
      };
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      const data = response.data;
      if (data.succeeded) {
        localStorage.setItem('resetEmail', email);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Gửi yêu cầu thất bại.' };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu.'
      };
    }
  };

  const verifyResetOtp = async (email: string, code: string) => {
    try {
      const response = await api.post('/auth/verify-reset-otp', { email, code });
      const data = response.data;
      if (data.succeeded) {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Mã xác thực không đúng hoặc đã hết hạn.' };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Xác thực OTP đặt lại mật khẩu thất bại.'
      };
    }
  };

  const resetPassword = async (email: string, newPassword: string) => {
    try {
      const response = await api.post('/auth/reset-password', { email, newPassword });
      const data = response.data;
      if (data.succeeded) {
        localStorage.removeItem('resetEmail');
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Đặt lại mật khẩu thất bại.' };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Đặt lại mật khẩu thất bại.'
      };
    }
  };

  const resendOtp = async (email: string) => {
    try {
      const response = await api.post('/auth/resend-otp', { email });
      const data = response.data;
      return { success: data.succeeded, message: data.message };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể gửi lại mã OTP.'
      };
    }
  };

  const checkEmailExists = async (email: string) => {
    try {
      const response = await api.get(`/auth/check-email?email=${encodeURIComponent(email)}`);
      return response.data.exists;
    } catch (error) {
      console.error('Error checking email exists:', error);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('resetEmail');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        verifyOtp,
        forgotPassword,
        verifyResetOtp,
        resetPassword,
        resendOtp,
        checkEmailExists,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
