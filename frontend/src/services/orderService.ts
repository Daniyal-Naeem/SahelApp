import axios from './axios';

// Order type (adjust based on your backend response)
export interface Order {
  _id: string;
  orderNumber?: string;
  user?: string | any;
  items: OrderItem[];
  total: number;
  subtotal: number;
  shippingCost?: number;
  discount?: number;
  creditUsed?: number;
  status: BackendOrderStatus; // Backend uses lowercase
  paymentMethod?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress?: Address;
  trackingNumber?: string;
  notes?: string;
  shippedAt?: string;
  deliveredAt?: string;
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

// Backend statuses (lowercase)
export type BackendOrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

// Frontend display statuses (capitalized)
export type OrderStatus = 
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

// Map backend status to frontend display status
export const mapBackendStatusToDisplay = (backendStatus: BackendOrderStatus): OrderStatus => {
  const statusMap: Record<BackendOrderStatus, OrderStatus> = {
    'pending': 'Pending',
    'confirmed': 'Confirmed',
    'processing': 'Processing',
    'shipped': 'Shipped',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
  };
  return statusMap[backendStatus] || 'Pending';
};

// Map frontend display status to backend status
export const mapDisplayStatusToBackend = (displayStatus: OrderStatus): BackendOrderStatus => {
  const statusMap: Record<OrderStatus, BackendOrderStatus> = {
    'Pending': 'pending',
    'Confirmed': 'confirmed',
    'Processing': 'processing',
    'Shipped': 'shipped',
    'Delivered': 'delivered',
    'Cancelled': 'cancelled',
  };
  return statusMap[displayStatus] || 'pending';
};

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
  status: BackendOrderStatus,
  trackingNumber?: string,
  notes?: string
): Promise<Order> => {
  try {
    const payload: any = { status };
    if (trackingNumber) payload.trackingNumber = trackingNumber;
    if (notes !== undefined) payload.notes = notes;
    
    const res = await axios.put(`/orders/${orderId}/status`, payload);
    return res.data.order || res.data;
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
    return res.data.order || res.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Get orders by status (requires authentication)
 */
export const getOrdersByStatus = async (status: BackendOrderStatus): Promise<Order[]> => {
  try {
    const res = await axios.get('/orders/my-orders', { params: { status } });
    return res.data.orders || res.data || [];
  } catch (error: any) {
    throw error;
  }
};

/**
 * Format order date for display
 */
export const formatOrderDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

/**
 * Get estimated delivery date (7 days from order date)
 */
export const getEstimatedDelivery = (orderDate?: string): string => {
  if (!orderDate) return 'N/A';
  const date = new Date(orderDate);
  date.setDate(date.getDate() + 7);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};


