import axios from './axios';

// Wishlist item type
export interface WishlistItem {
  _id: string;
  product: any; // Product object
  createdAt?: string;
}

// Wishlist type
export interface Wishlist {
  items: WishlistItem[];
  count?: number;
}

/**
 * Get user's wishlist (requires authentication)
 */
export const getWishlist = async (): Promise<Wishlist> => {
  try {
    const res = await axios.get('/wishlist');
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Add product to wishlist (requires authentication)
 */
export const addToWishlist = async (productId: string): Promise<Wishlist> => {
  try {
    const res = await axios.post('/wishlist/add', { productId });
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Remove product from wishlist (requires authentication)
 */
export const removeFromWishlist = async (productId: string): Promise<Wishlist> => {
  try {
    const res = await axios.delete(`/wishlist/remove/${productId}`);
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Toggle wishlist (add if not exists, remove if exists) (requires authentication)
 */
export const toggleWishlist = async (productId: string): Promise<Wishlist> => {
  try {
    const res = await axios.post('/wishlist/toggle', { productId });
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Check if product is in wishlist (requires authentication)
 */
export const checkWishlist = async (productId: string): Promise<boolean> => {
  try {
    const res = await axios.get(`/wishlist/check/${productId}`);
    return res.data.isInWishlist || false;
  } catch (error: any) {
    return false;
  }
};
