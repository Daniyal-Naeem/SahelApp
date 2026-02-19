import axios from './axios';

export interface Banner {
  _id: string;
  title: string;
  description?: string;
  image: string;
  targetUrl?: string; // Backend uses targetUrl, not link
  type: 'slider' | 'promotional' | 'ad' | 'deal';
  isActive: boolean;
  order: number;
  startDate?: string;
  endDate?: string;
  clickCount?: number;
  viewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Get all active banners (public)
export const getAllBanners = async (): Promise<Banner[]> => {
  try {
    const res = await axios.get('/banners');
    return res.data || [];
  } catch (error: any) {
    console.error('Error fetching banners:', error);
    return [];
  }
};

// Get banner by ID (public)
export const getBannerById = async (bannerId: string): Promise<Banner | null> => {
  try {
    const res = await axios.get(`/banners/${bannerId}`);
    return res.data;
  } catch (error: any) {
    console.error('Error fetching banner:', error);
    return null;
  }
};

// Track banner click (public)
export const trackBannerClick = async (bannerId: string): Promise<void> => {
  try {
    await axios.post(`/banners/${bannerId}/click`);
  } catch (error: any) {
    console.error('Error tracking banner click:', error);
    // Don't throw - tracking failures shouldn't break the app
  }
};

