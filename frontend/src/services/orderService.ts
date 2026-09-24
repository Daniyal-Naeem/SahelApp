import axios from './axios';

export type OrderItemInput = {
  productId: string;
  quantity?: number;
};

export type ShippingAddress = {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  phone?: string;
};

export const createOrder = async (payload: {
  items: OrderItemInput[];
  shippingAddress?: ShippingAddress;
  paymentMethod?: string;
  notes?: string;
}) => {
  const res = await axios.post('/orders/', payload);
  return res.data;
};

export const getMyOrders = async (status?: string) => {
  const res = await axios.get('/orders/my-orders', {
    params: status ? {status} : undefined,
  });
  return res.data;
};

export const getOrderById = async (id: string) => {
  const res = await axios.get(`/orders/${id}`);
  return res.data;
};

export const cancelOrder = async (id: string) => {
  const res = await axios.put(`/orders/${id}/cancel`);
  return res.data;
};
