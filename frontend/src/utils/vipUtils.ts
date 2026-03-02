import {type VIPMembership} from '../services/vipService';

/**
 * Calculate total spending from orders
 * This would typically come from an API call
 */
export const calculateTotalSpending = async (userId: string): Promise<number> => {
  try {
    // This would call an API endpoint to get total spending
    // For now, return 0 as placeholder
    // TODO: Implement API call to get user's total order value
    return 0;
  } catch (error) {
    console.error('Error calculating total spending:', error);
    return 0;
  }
};

/**
 * Determine if user should be auto-assigned VIP based on spending
 * Auto-assign VIP if total spending >= threshold
 */
export const shouldAutoAssignVIP = async (
  userId: string,
  threshold: number = 1000
): Promise<boolean> => {
  const totalSpending = await calculateTotalSpending(userId);
  return totalSpending >= threshold;
};

/**
 * Check if user qualifies for VIP tier upgrade based on spending
 */
export const getQualifiedTier = (totalSpending: number): 'bronze' | 'silver' | 'gold' | 'platinum' | null => {
  if (totalSpending >= 10000) {
    return 'platinum';
  } else if (totalSpending >= 5000) {
    return 'gold';
  } else if (totalSpending >= 2000) {
    return 'silver';
  } else if (totalSpending >= 500) {
    return 'bronze';
  }
  return null;
};

/**
 * Format VIP badge display text
 */
export const formatVIPBadgeText = (membership: VIPMembership | null): string => {
  if (!membership || !membership.isMember) {
    return '';
  }

  if (membership.isExpired) {
    return 'VIP (Expired)';
  }

  if (membership.tier) {
    const tierNames: Record<string, string> = {
      bronze: 'Bronze VIP',
      silver: 'Silver VIP',
      gold: 'Gold VIP',
      platinum: 'Platinum VIP',
    };
    return tierNames[membership.tier] || 'VIP Member';
  }

  return 'VIP Member';
};

/**
 * Check if VIP membership is active
 */
export const isVIPActive = (membership: VIPMembership | null): boolean => {
  if (!membership || !membership.isMember) {
    return false;
  }

  if (!membership.expiresAt) {
    return true; // No expiry means lifetime membership
  }

  const expiryDate = new Date(membership.expiresAt);
  return expiryDate > new Date();
};
