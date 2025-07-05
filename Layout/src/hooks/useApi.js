import { useAuth } from '../components/AuthContext';
import api from '../utils/axios';

export function useApi() {
  const { state, dispatch } = useAuth();

  // Sử dụng axios instance đã có interceptors
  const apiCall = async (url, options = {}) => {
    try {
      const response = await api({
        url,
        ...options,
      });
      return response;
    } catch (error) {
      // Axios interceptors đã xử lý token refresh và logout
      throw error;
    }
  };

  return { apiCall };
} 