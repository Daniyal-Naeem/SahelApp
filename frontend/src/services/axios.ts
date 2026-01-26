import axios, {AxiosInstance, InternalAxiosRequestConfig} from 'axios';
import {getItem} from '../utils/AsyncStorage';

const getBaseURL = (): string => {
  // For Android emulator, use 10.0.2.2 instead of localhost
  // For iOS simulator, use localhost
  // For physical device, use your computer's local IP address
  return __DEV__ 
    ? 'http://10.0.2.2:4000/api' // Android emulator - use 10.0.2.2 to access host machine
    : 'https://backend-4oii8uftk-daniyals-projects-a2864b3d.vercel.app/api'; // Production
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
