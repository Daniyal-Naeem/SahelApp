import axios, {AxiosInstance, InternalAxiosRequestConfig} from 'axios';
import {getItem} from '../utils/AsyncStorage';

const getBaseURL = (): string => {
  // TODO: Update with your actual backend URL
  // You can use environment variables or config file
  return 'http://localhost:4000/api'; // Change this to your backend URL
};

const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: getBaseURL(),
    timeout: 60000, // 60 seconds
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add token
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      try {
        const token = await getItem('token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error: any) {
        console.error('Error getting token:', error);
      }
      return config;
    },
    (error: any) => Promise.reject(error),
  );

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response: any) => response,
    async (error: any) => {
      if (error.response?.status === 401) {
        // Unauthorized - clear token and redirect to login
        try {
          const {removeItem} = await import('../utils/AsyncStorage');
          await removeItem('token');
          await removeItem('user');
          
          // TODO: Navigate to login screen
          // You can use navigation ref or event emitter here
          // For now, just log the error
          console.log('Unauthorized - please login again');
        } catch (err) {
          console.error('Error handling 401:', err);
        }
      }
      return Promise.reject(error);
    },
  );

  return instance;
};

const axiosInstance = createAxiosInstance();

export default axiosInstance;

