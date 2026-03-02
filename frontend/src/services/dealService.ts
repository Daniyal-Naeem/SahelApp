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
export const getAllDeals = async (type?: string): Promise<Deal[]> => {
  try {
    const params = type ? `?type=${type}` : '';
    const res = await axios.get(`/deals${params}`);
    return res.data || [];
  } catch (error: any) {
    console.error('Error fetching deals:', error);
    return [];
  }
};

// Get deals by type
export const getDealsByType = async (type: 'weekly' | 'monthly' | 'daily' | 'flash' | 'under_price'): Promise<Deal[]> => {
  try {
    return getAllDeals(type);
  } catch (error: any) {
    console.error('Error fetching deals by type:', error);
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

// Calculate time remaining for a deal (legacy - use DealCountdown component for real-time updates)
export const getTimeRemaining = (endDate: string): string => {
  const now = new Date().getTime();
  const end = new Date(endDate).getTime();
  const diff = end - now;

  if (diff <= 0) {
    return 'Expired';
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m remaining`;
  }
  return `${hours}h ${minutes}m ${seconds}s remaining`;
};

// Format deal discount for display
export const formatDealDiscount = (deal: Deal): string => {
  if (deal.discount) {
    return `${deal.discount}% OFF`;
  }
  if (deal.discountAmount) {
    return `SAR ${deal.discountAmount} OFF`;
  }
  return 'Special Deal';
};

// Get deal type label
export const getDealTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    weekly: 'Weekly Deal',
    monthly: 'Monthly Deal',
    daily: 'Daily Deal',
    flash: 'Flash Sale',
    under_price: 'Under Price',
  };
  return typeMap[type] || 'Special Deal';
};

