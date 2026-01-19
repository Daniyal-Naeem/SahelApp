import axios, {AxiosInstance, InternalAxiosRequestConfig} from 'axios';
import {getItem} from '../utils/AsyncStorage';

const getBaseURL = (): string => {
  return 'http://localhost:4000/api';
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
