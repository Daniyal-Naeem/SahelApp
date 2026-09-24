// API Service for Mobile App
// Base URL is resolved once in src/config/api.ts - change it there, not here.
import {API_BASE_URL} from '../config/api';

const BASE_URL = API_BASE_URL;

// Helper function to handle API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('API Call Error:', error);
    throw error;
  }
};

// Map backend product to frontend ProductTypes format
const mapProductToFrontend = (backendProduct: any): any => {
  return {
    _id: backendProduct._id,
    title: backendProduct.title,
    description: backendProduct.description || '',
    image: Array.isArray(backendProduct.image) 
      ? backendProduct.image 
      : backendProduct.image 
        ? [backendProduct.image] 
        : [],
    price: backendProduct.price || 0,
    priceBeforeDeal: backendProduct.priceBeforeDeal || backendProduct.price || 0,
    priceOff: backendProduct.priceOff 
      ? typeof backendProduct.priceOff === 'number' 
        ? backendProduct.priceOff.toFixed(2) 
        : backendProduct.priceOff
      : '0',
    stars: backendProduct.stars || 0,
    numberOfReview: backendProduct.numberOfReview || 0,
    ukSide: backendProduct.ukSide || [],
    tags: backendProduct.tags || [],
    status: backendProduct.status || {
      icon: '',
      name: '',
    },
    category: backendProduct.category || null,
    vendor: backendProduct.vendor || null,
    createdAt: backendProduct.createdAt || new Date().toISOString(),
    updatedAt: backendProduct.updatedAt || new Date().toISOString(),
    __v: backendProduct.__v || 0,
  };
};

// Map backend category to frontend format
const mapCategoryToFrontend = (backendCategory: any): any => {
  return {
    _id: backendCategory._id,
    title: backendCategory.name || '',
    image: backendCategory.image || backendCategory.icon || '',
    description: backendCategory.description || '',
  };
};

// API Functions
export const api = {
  // Get all products
  getProducts: async (): Promise<any[]> => {
    try {
      const products = await apiCall('/products/');
      if (Array.isArray(products)) {
        return products.map(mapProductToFrontend);
      }
      return [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  // Get single product by ID
  getProductById: async (id: string): Promise<any | null> => {
    try {
      const product = await apiCall(`/products/${id}`);
      return mapProductToFrontend(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  },

  // Get all categories
  getCategories: async (): Promise<any[]> => {
    try {
      const categories = await apiCall('/categories/');
      if (Array.isArray(categories)) {
        return categories.map(mapCategoryToFrontend);
      }
      return [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Get single category by ID
  getCategoryById: async (id: string): Promise<any | null> => {
    try {
      const category = await apiCall(`/categories/${id}`);
      return mapCategoryToFrontend(category);
    } catch (error) {
      console.error('Error fetching category:', error);
      return null;
    }
  },
};

export default api;

