import axios from './axios';

export interface PinnedProduct {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    [key: string]: any;
  };
  section: string; // e.g., 'featured', 'trending', 'new_arrivals'
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Get all pinned products (public)
export const getPinnedProducts = async (section?: string): Promise<PinnedProduct[]> => {
  try {
    const url = section ? `/pinned-products?section=${section}` : '/pinned-products';
    const res = await axios.get(url);
    return res.data || [];
  } catch (error: any) {
    console.error('Error fetching pinned products:', error);
    return [];
  }
};

// Get pinned products by section (public)
export const getPinnedProductsBySection = async (section: string): Promise<PinnedProduct[]> => {
  try {
    const res = await axios.get(`/pinned-products?section=${section}`);
    return res.data || [];
  } catch (error: any) {
    console.error('Error fetching pinned products by section:', error);
    return [];
  }
};

