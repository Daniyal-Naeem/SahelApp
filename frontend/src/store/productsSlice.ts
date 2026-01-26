import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {ProductTypes} from '../constants/types';

interface ProductsState {
  products: ProductTypes[];
  loading: boolean;
  error: string | null;
  currentSort: string;
  currentFilter: string;
}

const initialState: ProductsState = {
  products: [],
  loading: false,
  error: null,
  currentSort: 'none',
  currentFilter: 'all',
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<ProductTypes[]>) => {
      state.products = action.payload;
    },
    addProduct: (state, action: PayloadAction<ProductTypes>) => {
      state.products.push(action.payload);
    },
    updateProduct: (state, action: PayloadAction<ProductTypes>) => {
      const index = state.products.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    removeProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter(p => p._id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSort: (state, action: PayloadAction<string>) => {
      state.currentSort = action.payload;
    },
    setFilter: (state, action: PayloadAction<string>) => {
      state.currentFilter = action.payload;
    },
    clearProducts: state => {
      state.products = [];
      state.error = null;
    },
  },
});

export const {
  setProducts,
  addProduct,
  updateProduct,
  removeProduct,
  setLoading,
  setError,
  setSort,
  setFilter,
  clearProducts,
} = productsSlice.actions;

export default productsSlice.reducer;

