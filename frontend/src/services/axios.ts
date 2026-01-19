import axios, {AxiosInstance, InternalAxiosRequestConfig} from 'axios';
import {getItem} from '../utils/AsyncStorage';

const getBaseURL = (): string => {
  // For production APK, use deployed backend URL
  // For local development, use localhost or emulator address
  if (__DEV__) {
    return 'http://10.0.2.2:4000/api'; // Android emulator
  }
  
  // Production backend URL - UPDATE THIS after deploying backend
  return 'https://sahal-backend.onrender.com/api';
};

const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: getBaseURL(),
    timeout: 60000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      try {
        const token = await getItem('token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error: any) {
      }
      return config;
    },
    (error: any) => Promise.reject(error),
  );

  instance.interceptors.response.use(
    (response: any) => response,
    async (error: any) => {
      if (error.response?.status === 401) {
        try {
          const {removeItem} = await import('../utils/AsyncStorage');
          await removeItem('token');
          await removeItem('user');
        } catch (err) {
        }
      }
      return Promise.reject(error);
    },
  );

  return instance;
};

const axiosInstance = createAxiosInstance();

export default axiosInstance;
