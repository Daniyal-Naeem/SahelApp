import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {ProductTypes} from '../constants/types';

interface CartItem extends ProductTypes {
  quantity: number;
  cartItemId?: string;
  selectedVariation?: string;
  selectedColor?: string;
  selectedDelivery?: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
};

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

const calculateItemCount = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + item.quantity, 0);
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        item =>
          item._id === action.payload._id &&
          item.selectedVariation === action.payload.selectedVariation &&
          item.selectedColor === action.payload.selectedColor,
      );

      if (existingItem) {
        existingItem.quantity += action.payload.quantity || 1;
        if (action.payload.cartItemId) {
          existingItem.cartItemId = action.payload.cartItemId;
        }
      } else {
        state.items.push({
          ...action.payload,
          quantity: action.payload.quantity || 1,
        });
      }

      state.total = calculateTotal(state.items);
      state.itemCount = calculateItemCount(state.items);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        item =>
          item._id !== action.payload && item.cartItemId !== action.payload,
      );
      state.total = calculateTotal(state.items);
      state.itemCount = calculateItemCount(state.items);
    },
    updateCartItemQuantity: (
      state,
      action: PayloadAction<{id: string; quantity: number}>,
    ) => {
      const item = state.items.find(
        item =>
          item._id === action.payload.id ||
          item.cartItemId === action.payload.id,
      );
      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
        state.total = calculateTotal(state.items);
        state.itemCount = calculateItemCount(state.items);
      }
    },
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.total = calculateTotal(state.items);
      state.itemCount = calculateItemCount(state.items);
    },
    clearCart: state => {
      state.items = [];
      state.total = 0;
      state.itemCount = 0;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  setCartItems,
  clearCart,
} = cartSlice.actions;

export type {CartItem};
export default cartSlice.reducer;
