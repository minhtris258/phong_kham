import axios from 'axios';
import { API_URL } from '../config';
// 👇 IMPORT ASYNC STORAGE
import AsyncStorage from '@react-native-async-storage/async-storage';

const axiosClient = axios.create({
  // Đảm bảo IP này đúng với IP máy tính của bạn (192.168.1.10)
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 👇 SỬA PHẦN INTERCEPTOR (Phải dùng async/await với AsyncStorage)
axiosClient.interceptors.request.use(
  async (config) => {
    // Thay localStorage.getItem bằng await AsyncStorage.getItem
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosClient;
