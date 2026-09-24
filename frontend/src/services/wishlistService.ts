import axios from './axios';

export const getWishlist = async () => {
  const res = await axios.get('/wishlist/');
  return res.data;
};

export const addToWishlist = async (productId: string) => {
  const res = await axios.post('/wishlist/add', {productId});
  return res.data;
};

export const removeFromWishlist = async (productId: string) => {
  const res = await axios.delete(`/wishlist/remove/${productId}`);
  return res.data;
};

export const toggleWishlist = async (productId: string) => {
  const res = await axios.post('/wishlist/toggle', {productId});
  return res.data;
};

export const checkWishlist = async (productId: string) => {
  const res = await axios.get(`/wishlist/check/${productId}`);
  return res.data;
};
