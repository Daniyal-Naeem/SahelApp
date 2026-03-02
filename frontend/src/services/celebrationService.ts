import axios from './axios';

export interface CelebrationEvent {
  _id: string;
  user: string;
  type: 'birthday' | 'wedding' | 'newborn' | 'anniversary' | 'other';
  eventDate: string;
  isRecurring: boolean;
  name?: string;
  description?: string;
  notifyBeforeDays: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CelebrationCampaign {
  _id: string;
  title: string;
  description?: string;
  type: 'birthday' | 'wedding' | 'newborn' | 'anniversary' | 'other';
  discountType: 'percentage' | 'fixed' | 'gift_card';
  discountValue?: number;
  giftCardAmount?: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  autoSend: boolean;
  sendDaysBefore: number;
  applicableCategories?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterCelebrationPayload {
  type: 'birthday' | 'wedding' | 'newborn' | 'anniversary' | 'other';
  eventDate: string;
  name?: string;
  description?: string;
  isRecurring?: boolean;
  notifyBeforeDays?: number;
}

// Register a celebration event
export const registerCelebration = async (
  data: RegisterCelebrationPayload
): Promise<CelebrationEvent> => {
  try {
    const res = await axios.post('/celebrations/register', data);
    return res.data.celebration;
  } catch (error: any) {
    console.error('Error registering celebration:', error);
    throw error;
  }
};

// Get user's celebration events
export const getUserCelebrations = async (): Promise<CelebrationEvent[]> => {
  try {
    const res = await axios.get('/celebrations');
    return res.data || [];
  } catch (error: any) {
    console.error('Error fetching celebrations:', error);
    return [];
  }
};

// Get celebration campaigns for user
export const getCelebrationCampaigns = async (): Promise<CelebrationCampaign[]> => {
  try {
    const res = await axios.get('/celebrations/campaigns');
    return res.data || [];
  } catch (error: any) {
    console.error('Error fetching celebration campaigns:', error);
    return [];
  }
};

// Get campaigns by type (public)
export const getCampaignsByType = async (
  type: string
): Promise<CelebrationCampaign[]> => {
  try {
    const res = await axios.get(`/celebrations/campaigns/${type}`);
    return res.data || [];
  } catch (error: any) {
    console.error('Error fetching campaigns by type:', error);
    return [];
  }
};

// Update celebration event
export const updateCelebration = async (
  celebrationId: string,
  data: Partial<RegisterCelebrationPayload>
): Promise<CelebrationEvent> => {
  try {
    const res = await axios.put(`/celebrations/${celebrationId}`, data);
    return res.data.celebration;
  } catch (error: any) {
    console.error('Error updating celebration:', error);
    throw error;
  }
};

// Delete celebration event
export const deleteCelebration = async (
  celebrationId: string
): Promise<void> => {
  try {
    await axios.delete(`/celebrations/${celebrationId}`);
  } catch (error: any) {
    console.error('Error deleting celebration:', error);
    throw error;
  }
};

// Format celebration type for display
export const formatCelebrationType = (type: string): string => {
  const typeMap: Record<string, string> = {
    birthday: 'Birthday',
    wedding: 'Wedding',
    newborn: 'Newborn',
    anniversary: 'Anniversary',
    other: 'Other Celebration',
  };
  return typeMap[type] || type;
};

// Format event date
export const formatEventDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Get days until event
export const getDaysUntilEvent = (eventDate: string): number => {
  const now = new Date().getTime();
  const event = new Date(eventDate).getTime();
  const diff = event - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Check if event is upcoming (within next 30 days)
export const isEventUpcoming = (eventDate: string): boolean => {
  const daysUntil = getDaysUntilEvent(eventDate);
  return daysUntil >= 0 && daysUntil <= 30;
};

// Format campaign discount
export const formatCampaignDiscount = (campaign: CelebrationCampaign): string => {
  if (campaign.discountType === 'percentage' && campaign.discountValue) {
    return `${campaign.discountValue}% OFF`;
  }
  if (campaign.discountType === 'fixed' && campaign.discountValue) {
    return `SAR ${campaign.discountValue} OFF`;
  }
  if (campaign.discountType === 'gift_card' && campaign.giftCardAmount) {
    return `SAR ${campaign.giftCardAmount} Gift Card`;
  }
  return 'Special Offer';
};
