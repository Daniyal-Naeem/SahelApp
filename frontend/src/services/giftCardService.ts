import axios from './axios';

export interface GiftCard {
  _id: string;
  code: string;
  amount: number;
  currency: string;
  type: 'digital' | 'physical' | 'libre_bundle';
  status: 'active' | 'redeemed' | 'expired' | 'cancelled';
  expiresAt?: string;
  assignedTo?: {
    _id: string;
    name?: string;
    email?: string;
  };
  purchasedBy?: {
    _id: string;
    name?: string;
    email?: string;
  };
  redeemedBy?: {
    _id: string;
    name?: string;
    email?: string;
  };
  redeemedAt?: string;
  applicableCategories?: string[];
  applicableVendors?: string[];
  minPurchase?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Get user's gift cards (authenticated)
export const getUserGiftCards = async (): Promise<GiftCard[]> => {
  try {
    const res = await axios.get('/gift-cards');
    return res.data || [];
  } catch (error: any) {
    console.error('Error fetching gift cards:', error);
    return [];
  }
};

// Get gift card by code (public - for redemption)
export const getGiftCardByCode = async (code: string): Promise<GiftCard | null> => {
  try {
    const res = await axios.get(`/gift-cards/${code}`);
    return res.data;
  } catch (error: any) {
    console.error('Error fetching gift card by code:', error);
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

// Redeem gift card (authenticated)
export const redeemGiftCard = async (code: string): Promise<GiftCard> => {
  try {
    const res = await axios.post(`/gift-cards/${code}/redeem`);
    return res.data;
  } catch (error: any) {
    console.error('Error redeeming gift card:', error);
    throw error;
  }
};

// Format gift card status for display
export const formatGiftCardStatus = (status: string): 'collected' | 'redeem' => {
  switch (status) {
    case 'redeemed':
      return 'collected';
    case 'active':
      return 'redeem';
    default:
      return 'collected';
  }
};

// Format expiry date
export const formatExpiryDate = (expiresAt?: string): string => {
  if (!expiresAt) return 'No expiry';
  const date = new Date(expiresAt);
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear().toString().slice(-2)}`;
};

