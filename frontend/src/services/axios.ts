import axios, {AxiosInstance, InternalAxiosRequestConfig} from 'axios';
import {getItem} from '../utils/AsyncStorage';
import {API_BASE_URL} from '../config/api';

const getBaseURL = (): string => {
  return API_BASE_URL;
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
        // Storage read failed - send the request unauthenticated rather than
        // failing outright, but make the cause visible.
        console.warn('[api] could not read auth token from storage:', error);
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
          console.warn('[api] failed to clear session after 401:', err);
        }
      }
      return Promise.reject(error);
    },
  );

  return instance;
};

const axiosInstance = createAxiosInstance();

export default axiosInstance;
