import axios from './axios';

export interface AppAd {
  _id: string;
  title: string;
  description?: string;
  image: string;
  targetUrl: string;
  position: 'homepage' | 'product_detail' | 'cart' | 'checkout' | 'category' | 'search';
  order: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Get app ads by position (public)
export const getAppAds = async (
  position?: string
): Promise<AppAd[]> => {
  try {
    const params = position ? { position } : {};
    const res = await axios.get('/app-ads', { params });
    return res.data || [];
  } catch (error: any) {
    console.error('Error fetching app ads:', error);
    return [];
  }
};

// Track app ad click (public)
export const trackAppAdClick = async (adId: string): Promise<void> => {
  try {
    await axios.post(`/app-ads/${adId}/click`);
  } catch (error: any) {
    console.error('Error tracking app ad click:', error);
    // Don't throw - tracking failures shouldn't break the app
  }
};

// Track app ad view (public)
export const trackAppAdView = async (adId: string): Promise<void> => {
  try {
    await axios.post(`/app-ads/${adId}/view`);
  } catch (error: any) {
    console.error('Error tracking app ad view:', error);
    // Don't throw - tracking failures shouldn't break the app
  }
};
