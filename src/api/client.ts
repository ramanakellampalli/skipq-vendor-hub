import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

export const client = axios.create({
  baseURL: Config.API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

client.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('jwt');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.url?.includes('/auth/setup-password')) config.timeout = 30000;
  return config;
});

const AUTH_ENDPOINTS = ['/api/v1/auth/login', '/api/v1/auth/setup-password'];

client.interceptors.response.use(
  res => res,
  async error => {
    const url = error.config?.url ?? '';
    if (error.response?.status === 401 && !AUTH_ENDPOINTS.some(e => url.includes(e))) {
      await AsyncStorage.removeItem('jwt');
      const { useAuthStore } = await import('../store/authStore');
      useAuthStore.setState({ token: null, userId: null, name: null, email: null });
    }
    return Promise.reject(error);
  },
);
