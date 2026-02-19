import axios from './axios';

export interface VIPMembership {
  isMember: boolean;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | null;
  joinedAt: string | null;
  expiresAt: string | null;
  points: number;
  isExpired: boolean;
}

export interface VIPTierInfo {
  name: string;
  pointsRequired: number;
  benefits: string[];
  color: string;
}

// Get user's VIP status
export const getVIPStatus = async (): Promise<VIPMembership> => {
  try {
    const res = await axios.get('/vip/status');
    return res.data;
  } catch (error: any) {
    console.error('Error fetching VIP status:', error);
    // Return default non-member status on error
    return {
      isMember: false,
      tier: null,
      joinedAt: null,
      expiresAt: null,
      points: 0,
      isExpired: false,
    };
  }
};

// Join VIP Club
export const joinVIPClub = async (): Promise<VIPMembership> => {
  try {
    const res = await axios.post('/vip/join');
    return res.data.membership || res.data;
  } catch (error: any) {
    console.error('Error joining VIP Club:', error);
    throw error;
  }
};

// Add VIP points (typically called by system after orders/reviews)
export const addVIPPoints = async (points: number): Promise<void> => {
  try {
    await axios.post('/vip/points', { points });
  } catch (error: any) {
    console.error('Error adding VIP points:', error);
    // Don't throw - this is typically a background operation
  }
};

// Get tier information
export const getTierInfo = (tier: string | null): VIPTierInfo | null => {
  if (!tier) return null;

  const tierMap: Record<string, VIPTierInfo> = {
    bronze: {
      name: 'Bronze',
      pointsRequired: 0,
      benefits: [
        '5% discount on all orders',
        'Free shipping on orders over SAR 100',
        'Early access to sales',
      ],
      color: '#CD7F32',
    },
    silver: {
      name: 'Silver',
      pointsRequired: 2000,
      benefits: [
        '10% discount on all orders',
        'Free shipping on all orders',
        'Early access to new products',
        'Priority customer support',
      ],
      color: '#C0C0C0',
    },
    gold: {
      name: 'Gold',
      pointsRequired: 5000,
      benefits: [
        '15% discount on all orders',
        'Free shipping on all orders',
        'Early access to new products',
        'Priority customer support',
        'Special birthday offers',
        'Exclusive Gold member events',
      ],
      color: '#FFD700',
    },
    platinum: {
      name: 'Platinum',
      pointsRequired: 10000,
      benefits: [
        '20% discount on all orders',
        'Free shipping on all orders',
        'Early access to new products',
        'Priority customer support',
        'Special birthday offers',
        'Exclusive Platinum member events',
        'Personal shopping assistant',
        'VIP-only products',
      ],
      color: '#E5E4E2',
    },
  };

  return tierMap[tier] || null;
};

// Format membership expiry date
export const formatMembershipExpiry = (expiresAt: string | null): string => {
  if (!expiresAt) return 'N/A';
  const date = new Date(expiresAt);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Calculate days until expiry
export const getDaysUntilExpiry = (expiresAt: string | null): number | null => {
  if (!expiresAt) return null;
  const expiryDate = new Date(expiresAt);
  const today = new Date();
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

