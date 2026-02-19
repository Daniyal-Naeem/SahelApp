import axios from './axios';

export interface Review {
  _id: string;
  product: {
    _id: string;
    title?: string;
    name?: string;
    image?: string[];
  };
  user: {
    _id: string;
    name?: string;
    email?: string;
    avatar?: string;
  };
  rating: number; // 1-5
  title?: string;
  comment: string;
  images?: string[];
  verifiedPurchase?: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  flagged?: boolean;
  helpfulCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewQueryParams {
  productId?: string;
  userId?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'flagged';
  page?: number;
  limit?: number;
}

export interface ReviewResponse {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateReviewPayload {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  orderId?: string; // For verified purchase badge
}

// Get reviews (public: approved only, authenticated: own reviews + approved)
export const getReviews = async (params?: ReviewQueryParams): Promise<ReviewResponse> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params) {
      if (params.productId) queryParams.append('productId', params.productId);
      if (params.userId) queryParams.append('userId', params.userId);
      if (params.status) queryParams.append('status', params.status);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
    }
    
    const queryString = queryParams.toString();
    const url = queryString ? `/reviews?${queryString}` : '/reviews';
    const res = await axios.get(url);
    return res.data;
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

// Get single review by ID
export const getReviewById = async (reviewId: string): Promise<Review> => {
  try {
    const res = await axios.get(`/reviews/${reviewId}`);
    return res.data;
  } catch (error: any) {
    console.error('Error fetching review:', error);
    throw error;
  }
};

// Create review (authenticated)
export const createReview = async (payload: CreateReviewPayload): Promise<Review> => {
  try {
    const res = await axios.post('/reviews', payload);
    return res.data;
  } catch (error: any) {
    console.error('Error creating review:', error);
    throw error;
  }
};

// Update review (own review or admin)
export const updateReview = async (reviewId: string, payload: Partial<CreateReviewPayload>): Promise<Review> => {
  try {
    const res = await axios.put(`/reviews/${reviewId}`, payload);
    return res.data;
  } catch (error: any) {
    console.error('Error updating review:', error);
    throw error;
  }
};

// Delete review (own review or admin)
export const deleteReview = async (reviewId: string): Promise<void> => {
  try {
    await axios.delete(`/reviews/${reviewId}`);
  } catch (error: any) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

// Report review (authenticated)
export const reportReview = async (reviewId: string, reason: string): Promise<void> => {
  try {
    await axios.post(`/reviews/${reviewId}/report`, { reason });
  } catch (error: any) {
    console.error('Error reporting review:', error);
    throw error;
  }
};

// Get user's own reviews
export const getMyReviews = async (params?: Omit<ReviewQueryParams, 'userId'>): Promise<ReviewResponse> => {
  try {
    // First get current user ID from token/storage if needed
    // For now, backend will use userId from token
    return getReviews({ ...params, status: undefined }); // Get all statuses for own reviews
  } catch (error: any) {
    console.error('Error fetching my reviews:', error);
    throw error;
  }
};


