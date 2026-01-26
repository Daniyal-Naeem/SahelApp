import React, {createContext, useContext, useState, ReactNode} from 'react';
import {ProductTypes} from '../constants/types';

interface ProductsContextType {
  products: ProductTypes[];
  wishlist: ProductTypes[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  toggleWishlist: (product: ProductTypes) => void;
  applySort: (option: string) => void;
  applyFilter: (option: string) => void;
  currentSort: string;
  currentFilter: string;
  filteredAndSortedProducts: ProductTypes[];
}

const ProductsContext = createContext<ProductsContextType | undefined>(
  undefined,
);

export const ProductsProvider = ({
  children,
}: {children: ReactNode}) => {
  const [products, setProducts] = useState<ProductTypes[]>([]);
  const [wishlist, setWishlist] = useState<ProductTypes[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSort, setCurrentSort] = useState<string>('none');
  const [currentFilter, setCurrentFilter] = useState<string>('all');

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Products will be fetched by individual components
      setProducts([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = (product: ProductTypes) => {
    const isAlreadyInWishlist = wishlist.some(item => item._id === product._id);
    if (isAlreadyInWishlist) {
      setWishlist(wishlist.filter(item => item._id !== product._id));
    } else {
      setWishlist([...wishlist, product]);
    }
  };

  const applySort = (option: string) => {
    setCurrentSort(option);
  };

  const applyFilter = (option: string) => {
    setCurrentFilter(option);
  };

  const filteredAndSortedProducts = products;

  return (
    <ProductsContext.Provider
      value={{
        products,
        wishlist,
        loading,
        error,
        fetchProducts,
        toggleWishlist,
        applySort,
        applyFilter,
        currentSort,
        currentFilter,
        filteredAndSortedProducts,
      }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};

