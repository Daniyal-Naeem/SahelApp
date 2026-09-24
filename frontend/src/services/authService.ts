import axios from './axios';
import {setItem, getItem, removeItem} from '../utils/AsyncStorage';
import type {AuthUser} from '../store/authSlice';

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'user' | 'vendor';
  businessName?: string;
  businessAddress?: string;
};

export type AuthResponse = {
  message: string;
  user: AuthUser;
  token: string;
};

const persistSession = async (token: string, user: AuthUser) => {
  await setItem('token', token);
  await setItem('user', user);
};

export const login = async (data: LoginPayload): Promise<AuthResponse> => {
  const res = await axios.post('/auth/login', data);
  await persistSession(res.data.token, res.data.user);
  return res.data;
};

export const register = async (
  data: RegisterPayload,
): Promise<AuthResponse> => {
  const res = await axios.post('/auth/register', data);
  await persistSession(res.data.token, res.data.user);
  return res.data;
};

export const getMe = async (): Promise<AuthUser> => {
  const res = await axios.get('/auth/me');
  await setItem('user', res.data);
  return res.data;
};

export const updateProfile = async (
  userId: string,
  data: Partial<AuthUser>,
): Promise<AuthUser> => {
  const res = await axios.put(`/auth/profile/${userId}`, data);
  const user = res.data.user || res.data;
  await setItem('user', user);
  return user;
};

export const logout = async (): Promise<void> => {
  await removeItem('token');
  await removeItem('user');
};

export const getStoredSession = async (): Promise<{
  token: string | null;
  user: AuthUser | null;
}> => {
  const token = (await getItem('token')) as string | null;
  const user = (await getItem('user')) as AuthUser | null;
  return {token, user};
};

export const getCreditBalance = async (): Promise<number> => {
  const res = await axios.get('/credits/balance');
  return res.data.balance ?? res.data.credits ?? 0;
};
