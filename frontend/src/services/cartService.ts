import axios from './axios';

export const getCart = async () => {
  const res = await axios.get('/cart/');
  return res.data;
};

export const addCartItem = async (payload: {
  productId: string;
  quantity?: number;
  selectedVariation?: string;
  selectedColor?: string;
  selectedDelivery?: string;
}) => {
  const res = await axios.post('/cart/add', payload);
  return res.data;
};

export const updateCartItem = async (itemId: string, quantity: number) => {
  const res = await axios.put(`/cart/update/${itemId}`, {quantity});
  return res.data;
};

export const removeCartItem = async (itemId: string) => {
  const res = await axios.delete(`/cart/remove/${itemId}`);
  return res.data;
};

export const clearCartApi = async () => {
  const res = await axios.delete('/cart/clear');
  return res.data;
};
