import React, { createContext, useReducer, useContext, useEffect } from 'react';
import api from '../utils/axios';

const AuthContext = createContext();

const initialState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  ipAddress: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        ipAddress: action.payload.ipAddress,
      };
    case 'REFRESH_TOKEN':
      return {
        ...state,
        accessToken: action.payload.accessToken,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        ipAddress: null,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState, (init) => {
    // Khởi tạo từ localStorage nếu có
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const user = localStorage.getItem('user');
    const ipAddress = localStorage.getItem('ipAddress');
    if (accessToken && refreshToken) {
      return {
        ...init,
        isAuthenticated: true,
        user: user ? JSON.parse(user) : null,
        accessToken,
        refreshToken,
        ipAddress: ipAddress || null,
      };
    }
    return init;
  });

  useEffect(() => {
    if (state.isAuthenticated && state.accessToken && state.refreshToken) {
      localStorage.setItem('accessToken', state.accessToken);
      localStorage.setItem('refreshToken', state.refreshToken);
      localStorage.setItem('user', JSON.stringify(state.user));
      if (state.ipAddress) {
        localStorage.setItem('ipAddress', state.ipAddress);
      }
    } else {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('ipAddress');
    }
  }, [state.isAuthenticated, state.accessToken, state.refreshToken, state.user, state.ipAddress]);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}

// Utility functions để xử lý JWT
export const authUtils = {
  // Kiểm tra token có hết hạn chưa
  isTokenExpired: (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  },

  // Lấy thông tin từ token
  getTokenPayload: (token) => {
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      return null;
    }
  },

  // Refresh token
  refreshAccessToken: async (refreshToken) => {
    try {
      const response = await api.post('/token/refresh/', { refresh: refreshToken });
      return response.data.access;
    } catch (error) {
      return null;
    }
  },

  // Tạo headers với access token
  getAuthHeaders: (accessToken) => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    };
  },
};

export function useAuth() {
  return useContext(AuthContext);
} 