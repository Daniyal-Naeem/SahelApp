import axios from './axios';

// Product type (adjust based on your backend response)
export interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category?: string;
  vendor?: string;
  stock?: number;
  rating?: number;
  reviewsCount?: number;
  variations?: any[];
  colors?: string[];
  sizes?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Product query parameters
export interface ProductQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  vendor?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'rating' | 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// Search products (public - guest mode)
export const searchProducts = async (query: string, params?: ProductQueryParams) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    
    if (params) {
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.category) queryParams.append('category', params.category);
      if (params.vendor) queryParams.append('vendor', params.vendor);
      if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
      if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    }
    
    const res = await axios.get(`/products/search?${queryParams.toString()}`);
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

// Get all products (public - guest mode)
export const getAllProducts = async (params?: ProductQueryParams) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params) {
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.category) queryParams.append('category', params.category);
      if (params.vendor) queryParams.append('vendor', params.vendor);
      if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
      if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.search) queryParams.append('search', params.search);
    }
    
    const queryString = queryParams.toString();
    const url = queryString ? `/products?${queryString}` : '/products';
    const res = await axios.get(url);
    
    // Backend returns array when products exist, or {message: " No Products Found "} when empty
    // Handle both cases
    if (res.data && Array.isArray(res.data)) {
      return res.data; // Return array directly
    } else if (res.data && res.data.message) {
      // No products found - return empty array instead of throwing error
      console.log('No products found:', res.data.message);
      return [];
    }
    
    return res.data;
  } catch (error: any) {
    // Handle 404 (no products found) gracefully
    if (error.response?.status === 404) {
      console.log('No products found (404)');
      return [];
    }
    throw error;
  }
};

// Get single product (public - guest mode)
export const getProductById = async (productId: string) => {
  try {
    const res = await axios.get(`/products/${productId}`);
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

// Get products by category (public - guest mode)
export const getProductsByCategory = async (categoryId: string, params?: ProductQueryParams) => {
  try {
    return getAllProducts({ ...params, category: categoryId });
  } catch (error: any) {
    throw error;
  }
};

// Get products by vendor (public - guest mode)
export const getProductsByVendor = async (vendorId: string, params?: ProductQueryParams) => {
  try {
    return getAllProducts({ ...params, vendor: vendorId });
  } catch (error: any) {
    throw error;
  }
};


