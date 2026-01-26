import axios from './axios';
import { setItem, removeItem } from '../utils/AsyncStorage';
import { executePendingActions } from '../utils/authGuard';

// Login payload type
export type LoginPayload = {
  email?: string;
  username?: string;
  password: string;
};

// Register payload type
export type RegisterPayload = {
  email?: string;
  username?: string;
  phone?: string;
  password: string;
  name?: string;
};

// Apple login payload type
export type AppleLoginPayload = {
  idToken: string;
  user: {
    email?: string;
    name?: string;
  };
};

// Google login payload type
export type GoogleLoginPayload = {
  idToken: string;
  accessToken?: string;
  user?: {
    email?: string;
    name?: string;
  };
};

// Facebook login payload type
export type FacebookLoginPayload = {
  accessToken: string;
  user?: {
    email?: string;
    name?: string;
  };
};

// Forgot password payload type
export type ForgotPasswordPayload = {
  email?: string;
  phone?: string;
  type: 'email' | 'sms';
};

// Verify OTP payload type
export type VerifyOTPPayload = {
  email?: string;
  phone?: string;
  otp: string;
  type: 'email' | 'sms';
};

// Reset password payload type
export type ResetPasswordPayload = {
  email?: string;
  phone?: string;
  otp: string;
  newPassword: string;
  type: 'email' | 'sms';
};

// Update profile payload type
export type UpdateProfilePayload = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  avatar?: string;
};

// Login
export const login = async (data: LoginPayload, navigation?: any) => {
  try {
    const res = await axios.post('/auth/login', data);
    
    // Store token and user data
    if (res.data.token) {
      await setItem('token', res.data.token);
    }
    if (res.data.user) {
      // Always stringify user data for consistency
      await setItem('user', JSON.stringify(res.data.user));
    }
    
    // Execute pending actions after successful login
    if (navigation) {
      await executePendingActions(navigation);
    }
    
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

// Register
export const register = async (data: RegisterPayload, navigation?: any) => {
  try {
    // Name is not required on signup - only email and password
    // Don't send name field at all if not provided
    const registerData: any = {
      email: data.email,
      password: data.password,
    };
    
    // Only include optional fields if they are provided
    if (data.phone) {
      registerData.phone = data.phone;
    }
    
    const res = await axios.post('/auth/register', registerData);
    
    // Store token and user data
    if (res.data.token) {
      await setItem('token', res.data.token);
    }
    if (res.data.user) {
      // Always stringify user data for consistency
      await setItem('user', JSON.stringify(res.data.user));
    }
    
    // Execute pending actions after successful registration
    if (navigation) {
      await executePendingActions(navigation);
    }
    
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

// Apple login
export const appleLogin = async (data: AppleLoginPayload, navigation?: any) => {
  try {
    const res = await axios.post('/auth/apple', data);
    
    // Store token and user data
    if (res.data.token) {
      await setItem('token', res.data.token);
    }
    if (res.data.user) {
      // Always stringify user data for consistency
      await setItem('user', JSON.stringify(res.data.user));
    }
    
    // Execute pending actions after successful login
    if (navigation) {
      await executePendingActions(navigation);
    }
    
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

// Google login
export const googleLogin = async (data: GoogleLoginPayload, navigation?: any) => {
  try {
    const res = await axios.post('/auth/google', data);
    
    // Store token and user data
    if (res.data.token) {
      await setItem('token', res.data.token);
    }
    if (res.data.user) {
      // Always stringify user data for consistency
      await setItem('user', JSON.stringify(res.data.user));
    }
    
    // Execute pending actions after successful login
    if (navigation) {
      await executePendingActions(navigation);
    }
    
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

// Facebook login
export const facebookLogin = async (data: FacebookLoginPayload, navigation?: any) => {
  try {
    const res = await axios.post('/auth/facebook', data);
    
    // Store token and user data
    if (res.data.token) {
      await setItem('token', res.data.token);
    }
    if (res.data.user) {
      // Always stringify user data for consistency
      await setItem('user', JSON.stringify(res.data.user));
    }
    
    // Execute pending actions after successful login
    if (navigation) {
      await executePendingActions(navigation);
    }
    
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

// Forgot password - Send OTP
export const forgotPassword = async (data: ForgotPasswordPayload) => {
  try {
    const res = await axios.post('/auth/forgot-password', data);
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

// Verify OTP
export const verifyOTP = async (data: VerifyOTPPayload) => {
  try {
    const res = await axios.post('/auth/verify-otp', data);
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

// Reset password
export const resetPassword = async (data: ResetPasswordPayload) => {
  try {
    const res = await axios.post('/auth/reset-password', data);
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

// Get current user profile
export const getCurrentUser = async () => {
  try {
    const res = await axios.get('/auth/me');
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

// Update user profile
export const updateProfile = async (userId: string, data: UpdateProfilePayload) => {
  try {
    const res = await axios.put(`/auth/profile/${userId}`, data);
    
    // Update stored user data
    if (res.data.user) {
      await setItem('user', res.data.user);
    }
    
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

// Logout
export const logout = async () => {
  try {
    // Clear stored auth data
    await removeItem('token');
    await removeItem('user');
    return { success: true };
  } catch (error: any) {
    throw error;
  }
};

