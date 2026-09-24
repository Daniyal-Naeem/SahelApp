import {configureStore} from '@reduxjs/toolkit';
import productsReducer from './productsSlice';
import cartReducer from './cartSlice';
import wishlistReducer from './wishlistSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    auth: authReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['items.date'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

