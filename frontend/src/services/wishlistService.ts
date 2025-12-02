// Wishlist service - API calls are commented out until endpoints are available
// import axios from './axios';

// Get user's wishlist
export const getWishlist = async () => {
  // TODO: Uncomment when API endpoint is available
  // try {
  //   const res = await axios.get('/wishlist');
  //   return res.data;
  // } catch (error: any) {
  //   throw error;
  // }
  throw new Error('API endpoint not available yet');
};

// Add product to wishlist
export const addToWishlist = async (productId: string) => {
  // TODO: Uncomment when API endpoint is available
  // try {
  //   const res = await axios.post('/wishlist', {productId});
  //   return res.data;
  // } catch (error: any) {
  //   throw error;
  // }
  throw new Error('API endpoint not available yet');
};

// Remove product from wishlist
export const removeFromWishlist = async (productId: string) => {
  // TODO: Uncomment when API endpoint is available
  // try {
  //   const res = await axios.delete(`/wishlist/${productId}`);
  //   return res.data;
  // } catch (error: any) {
  //   throw error;
  // }
  throw new Error('API endpoint not available yet');
};

// Toggle wishlist (add if not exists, remove if exists)
export const toggleWishlist = async (productId: string) => {
  // TODO: Uncomment when API endpoint is available
  // try {
  //   const res = await axios.post('/wishlist/toggle', {productId});
  //   return res.data;
  // } catch (error: any) {
  //   throw error;
  // }
  throw new Error('API endpoint not available yet');
};
