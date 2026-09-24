import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'vendor' | 'admin';
  vendorStatus?: 'pending' | 'approved' | 'rejected';
  businessName?: string;
  profilePicture?: string;
  credits?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
};

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  hydrated: boolean;
}

const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
  hydrated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{token: string; user: AuthUser}>,
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.hydrated = true;
    },
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearCredentials: state => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.hydrated = true;
    },
    setHydrated: (state, action: PayloadAction<boolean>) => {
      state.hydrated = action.payload;
    },
  },
});

export const {setCredentials, setUser, clearCredentials, setHydrated} =
  authSlice.actions;
export default authSlice.reducer;
