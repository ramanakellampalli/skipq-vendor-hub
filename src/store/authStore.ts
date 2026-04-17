import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  token: string | null;
  userId: string | null;
  name: string | null;
  email: string | null;
  isLoading: boolean;
  setAuth: (token: string, userId: string, name: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>(set => ({
  token: null,
  userId: null,
  name: null,
  email: null,
  isLoading: true,

  setAuth: async (token, userId, name, email) => {
    await AsyncStorage.setItem('jwt', token);
    await AsyncStorage.setItem('userId', userId);
    await AsyncStorage.setItem('name', name);
    await AsyncStorage.setItem('email', email);
    set({ token, userId, name, email });
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['jwt', 'userId', 'name', 'email']);
    set({ token: null, userId: null, name: null, email: null });
  },

  loadFromStorage: async () => {
    const token = await AsyncStorage.getItem('jwt');
    const userId = await AsyncStorage.getItem('userId');
    const name = await AsyncStorage.getItem('name');
    const email = await AsyncStorage.getItem('email');
    set({ token, userId, name, email, isLoading: false });
  },
}));
