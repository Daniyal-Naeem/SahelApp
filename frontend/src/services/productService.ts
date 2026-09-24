import axios from './axios';

export const createProduct = async (payload: {
  title: string;
  description: string;
  price: number;
  priceBeforeDeal?: number;
  priceOff?: number;
  image: string[];
  category?: string;
  tags?: string[];
  status?: {icon: string; name: string};
  ukSide?: string[];
}) => {
  const res = await axios.post('/products/', {
    ...payload,
    priceBeforeDeal: payload.priceBeforeDeal ?? payload.price,
    priceOff: payload.priceOff ?? 0,
    status: payload.status || {icon: '🆕', name: 'New'},
    tags: payload.tags || [],
  });
  return res.data;
};

export const getMyVendorProducts = async () => {
  const res = await axios.get('/products/', {params: {vendor: 'me'}});
  return Array.isArray(res.data) ? res.data : [];
};

export const updateProduct = async (id: string, payload: Record<string, any>) => {
  const res = await axios.put(`/products/${id}`, payload);
  return res.data;
};

export const getCategories = async () => {
  const res = await axios.get('/categories/');
  return Array.isArray(res.data) ? res.data : res.data?.categories || [];
};

export const getProductById = async (id: string) => {
  const res = await axios.get(`/products/${id}`);
  return res.data;
};

export const getProducts = async () => {
  const res = await axios.get('/products/');
  return Array.isArray(res.data) ? res.data : res.data?.products || [];
};
