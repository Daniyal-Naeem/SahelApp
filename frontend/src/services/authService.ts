import axios from './axios';

// Login payload type
export type LoginPayload = {
  email?: string;
  username?: string;
  password: string;
};

// Apple login payload type
export type AppleLoginPayload = {
  idToken: string;
  user: {
    email?: string;
    name?: string;
  };
};

// Login
export const login = async (data: LoginPayload) => {
  try {
    const res = await axios.post('/auth/login', data);
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

// Apple login
export const appleLogin = async (data: AppleLoginPayload) => {
  try {
    const res = await axios.post('/auth/apple', data);
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

