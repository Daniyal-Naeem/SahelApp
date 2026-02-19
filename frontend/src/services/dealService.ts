import axios from './axios';

export interface Deal {
  _id: string;
  title: string;
  description?: string;
  type: 'weekly' | 'monthly' | 'daily' | 'flash' | 'under_price';
  discount?: number; // Backend uses discount (percentage), not discountPercentage
  discountAmount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  products?: string[]; // Product IDs
  categories?: string[]; // Category IDs
  vendor?: string;
  maxDiscount?: number; // Maximum discount cap
  minPurchase?: number; // Minimum purchase requirement
  maxUses?: number;
  currentUses?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Get all active deals (public)
export const getAllDeals = async (): Promise<Deal[]> => {
  try {
    const res = await axios.get('/deals');
    return res.data || [];
  } catch (error: any) {
    console.error('Error fetching deals:', error);
    return [];
  }
};

// Get deal by ID (public)
export const getDealById = async (dealId: string): Promise<Deal | null> => {
  try {
    const res = await axios.get(`/deals/${dealId}`);
    return res.data;
  } catch (error: any) {
    console.error('Error fetching deal:', error);
    return null;
  }
};

// Calculate time remaining for a deal
export const getTimeRemaining = (endDate: string): string => {
  const now = new Date().getTime();
  const end = new Date(endDate).getTime();
  const diff = end - now;

  if (diff <= 0) {
    return 'Expired';
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${hours}h ${minutes}m ${seconds}s remaining`;
};

