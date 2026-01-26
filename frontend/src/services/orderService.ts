import axios from './axios';

// Order type (adjust based on your backend response)
export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  tax?: number;
  shipping?: number;
  status: OrderStatus;
  paymentMethod?: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  orderDate: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  _id?: string;
  product: string | any; // Product ID or full product object
  quantity: number;
  price: number;
  variation?: {
    color?: string;
    size?: string;
    [key: string]: any;
  };
}

export type OrderStatus = 
  | 'Pending'
  | 'Processing'
  | 'Shipped'
  | 'In Transit'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface Address {
  street: string;
  city: string;
  state?: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface CreateOrderPayload {
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: string;
  subtotal: number;
  tax?: number;
  shipping?: number;
  total: number;
  notes?: string;
}

/**
 * Create a new order (requires authentication)
 */
export const createOrder = async (orderData: CreateOrderPayload): Promise<Order> => {
  try {
    const res = await axios.post('/orders', orderData);
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Get user's orders (requires authentication)
 */
export const getUserOrders = async (): Promise<Order[]> => {
  try {
    const res = await axios.get('/orders/my-orders');
    return res.data.orders || res.data || [];
  } catch (error: any) {
    throw error;
  }
};

/**
 * Get single order by ID (requires authentication)
 */
export const getOrderById = async (orderId: string): Promise<Order> => {
  try {
    const res = await axios.get(`/orders/${orderId}`);
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Update order status (requires authentication - typically admin only)
 */
export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
): Promise<Order> => {
  try {
    const res = await axios.put(`/orders/${orderId}/status`, { status });
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Cancel order (requires authentication)
 */
export const cancelOrder = async (orderId: string): Promise<Order> => {
  try {
    const res = await axios.put(`/orders/${orderId}/cancel`);
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Get orders by status (requires authentication)
 */
export const getOrdersByStatus = async (status: OrderStatus): Promise<Order[]> => {
  try {
    const orders = await getUserOrders();
    return orders.filter(order => order.status === status);
  } catch (error: any) {
    throw error;
  }
};

