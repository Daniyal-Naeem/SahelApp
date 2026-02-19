import axios from './axios';

export interface Coupon {
  _id: string;
  code: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  minPurchase?: number;
  maxUses?: number;
  maxUsesPerUser?: number;
  currentUses?: number;
  startsAt?: string;
  expiresAt?: string;
  applicableCategories?: string[];
  applicableProducts?: string[];
  excludedCategories?: string[];
  excludedProducts?: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CouponValidationResult {
  valid: boolean;
  coupon?: {
    code: string;
    name: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
  };
  discount: number;
  finalAmount: number;
  error?: string;
  minPurchase?: number;
}

// Get all active coupons (public)
export const getAllCoupons = async (): Promise<Coupon[]> => {
  try {
    const res = await axios.get('/coupons');
    return res.data || [];
  } catch (error: any) {
    console.error('Error fetching coupons:', error);
    return [];
  }
};

// Get coupon by code (public)
export const getCouponByCode = async (code: string): Promise<Coupon | null> => {
  try {
    const res = await axios.get(`/coupons/${code}`);
    return res.data;
  } catch (error: any) {
    console.error('Error fetching coupon by code:', error);
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

// Validate coupon for order (authenticated)
export const validateCoupon = async (
  code: string,
  orderTotal: number,
  items?: Array<{productId: string; quantity: number; price: number}>
): Promise<CouponValidationResult> => {
  try {
    const res = await axios.post('/coupons/validate', {
      code: code.toUpperCase(),
      orderTotal,
      items: items || [],
    });
    return res.data;
  } catch (error: any) {
    console.error('Error validating coupon:', error);
    if (error.response?.data) {
      return {
        valid: false,
        discount: 0,
        finalAmount: orderTotal,
        error: error.response.data.error,
        minPurchase: error.response.data.minPurchase,
      };
    }
    throw error;
  }
};

// Apply coupon to order (authenticated) - This is typically done during order creation
export const applyCouponToOrder = async (
  code: string,
  orderId: string
): Promise<any> => {
  try {
    const res = await axios.post(`/coupons/${code}/apply`, {
      orderId,
    });
    return res.data;
  } catch (error: any) {
    console.error('Error applying coupon to order:', error);
    throw error;
  }
};


