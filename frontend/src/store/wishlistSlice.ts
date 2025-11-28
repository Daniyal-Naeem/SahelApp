import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {ProductTypes} from '../constants/types';

interface WishlistState {
  items: ProductTypes[];
}

const initialState: WishlistState = {
  items: [],
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    // Add to wishlist
    addToWishlist: (state, action: PayloadAction<ProductTypes>) => {
      const product = action.payload;
      const exists = state.items.some(item => item._id === product._id);
      if (!exists) {
        state.items.push(product);
      }
    },
    // Remove from wishlist
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item._id !== productId);
    },
    // Toggle wishlist (add if not exists, remove if exists)
    toggleWishlist: (state, action: PayloadAction<ProductTypes>) => {
      const product = action.payload;
      const index = state.items.findIndex(item => item._id === product._id);
      if (index !== -1) {
        // Remove if exists
        state.items.splice(index, 1);
      } else {
        // Add if doesn't exist
        state.items.push(product);
      }
    },
    // Set wishlist items (for initial load or sync)
    setWishlist: (state, action: PayloadAction<ProductTypes[]>) => {
      state.items = action.payload;
    },
    // Clear wishlist (on logout)
    clearWishlist: state => {
      state.items = [];
    },
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  setWishlist,
  clearWishlist,
} = wishlistSlice.actions;

// Helper selector to check if item is in wishlist
export const selectIsInWishlist = (productId: string) => (state: {wishlist: WishlistState}) =>
  state.wishlist.items.some(item => item._id === productId);

export default wishlistSlice.reducer;
