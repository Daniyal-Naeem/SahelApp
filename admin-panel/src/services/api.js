import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth APIs
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  getCurrentUser: () => api.get('/auth/me'),
}

// Admin APIs
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id, isActive) => api.put(`/admin/users/${id}/status`, { isActive }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAllVendors: (params) => api.get('/admin/vendors', { params }),
  approveVendor: (id) => api.put(`/admin/vendors/${id}/approve`),
  rejectVendor: (id, reason) => api.put(`/admin/vendors/${id}/reject`, { reason }),
  // Create entities
  createUser: (userData) => api.post('/auth/register', userData),
  createProduct: (productData) => api.post('/products', productData),
}

// Product APIs
export const productAPI = {
  getAllProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  createProduct: (productData) => api.post('/products', productData),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
}

// Category APIs
export const categoryAPI = {
  getAllCategories: () => api.get('/categories'),
  getCategoryById: (id) => api.get(`/categories/${id}`),
  createCategory: (categoryData) => api.post('/categories', categoryData),
  updateCategory: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
}

// Credit Admin APIs (v1)
export const creditAdminAPI = {
  getCreditStats: () => api.get('/v1/admin/credits/stats'),
  getCreditBalances: (params) => api.get('/v1/admin/credits/balances', { params }),
  getUserCreditBalance: (userId) => api.get(`/v1/admin/credits/balance/${userId}`),
  getCreditTransactions: (params) => api.get('/v1/admin/credits/transactions', { params }),
  adjustCredit: (userId, amount, reason) => api.post('/v1/admin/credits/adjust', { userId, amount, reason }),
}

// Banner APIs
export const bannerAPI = {
  getAllBanners: () => api.get('/banners'),
  getBannerById: (id) => api.get(`/banners/${id}`),
  createBanner: (bannerData) => api.post('/banners', bannerData),
  updateBanner: (id, bannerData) => api.put(`/banners/${id}`, bannerData),
  deleteBanner: (id) => api.delete(`/banners/${id}`),
  trackClick: (id) => api.post(`/banners/${id}/click`),
}

// Deal APIs
export const dealAPI = {
  getAllDeals: (params) => api.get('/deals', { params }),
  getDealById: (id) => api.get(`/deals/${id}`),
  createDeal: (dealData) => api.post('/deals', dealData),
  updateDeal: (id, dealData) => api.put(`/deals/${id}`, dealData),
  deleteDeal: (id) => api.delete(`/deals/${id}`),
}

// Pinned Products APIs
export const pinnedProductAPI = {
  getPinnedProducts: (params) => api.get('/pinned-products', { params }),
  pinProduct: (productData) => api.post('/pinned-products', productData),
  unpinProduct: (id) => api.delete(`/pinned-products/${id}`),
}

// App Ad APIs
export const appAdAPI = {
  getAllAds: (params) => api.get('/app-ads', { params }),
  getAdById: (id) => api.get(`/app-ads/${id}`),
  createAd: (adData) => api.post('/app-ads', adData),
  updateAd: (id, adData) => api.put(`/app-ads/${id}`, adData),
  deleteAd: (id) => api.delete(`/app-ads/${id}`),
}

// Gift Card APIs
export const giftCardAPI = {
  getAllGiftCards: (params) => api.get('/gift-cards', { params }),
  getGiftCardByCode: (code) => api.get(`/gift-cards/${code}`),
  createGiftCard: (giftCardData) => api.post('/gift-cards', giftCardData),
  createBulkGiftCards: (data) => api.post('/gift-cards/bulk', data),
  updateGiftCard: (id, giftCardData) => api.put(`/gift-cards/${id}`, giftCardData),
  deleteGiftCard: (id) => api.delete(`/gift-cards/${id}`),
  redeemGiftCard: (code) => api.post(`/gift-cards/${code}/redeem`),
}

// Coupon APIs
export const couponAPI = {
  getAllCoupons: (params) => api.get('/coupons', { params }),
  getCouponByCode: (code) => api.get(`/coupons/${code}`),
  validateCoupon: (data) => api.post('/coupons/validate', data),
  createCoupon: (couponData) => api.post('/coupons', couponData),
  updateCoupon: (id, couponData) => api.put(`/coupons/${id}`, couponData),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`),
  applyCoupon: (code, data) => api.post(`/coupons/${code}/apply`, data),
}

// Review APIs
export const reviewAPI = {
  getAllReviews: (params) => api.get('/reviews', { params }),
  getReviewById: (id) => api.get(`/reviews/${id}`),
  createReview: (reviewData) => api.post('/reviews', reviewData),
  updateReview: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  getPendingReviews: (params) => api.get('/reviews/pending', { params }),
  getFlaggedReviews: (params) => api.get('/reviews/flagged', { params }),
  approveReview: (id, notes) => api.post(`/reviews/${id}/approve`, { notes }),
  rejectReview: (id, notes) => api.post(`/reviews/${id}/reject`, { notes }),
  flagReview: (id, reason) => api.post(`/reviews/${id}/flag`, { reason }),
  unflagReview: (id) => api.post(`/reviews/${id}/unflag`),
  bulkApproveReviews: (reviewIds) => api.post('/reviews/bulk-approve', { reviewIds }),
  bulkRejectReviews: (reviewIds, notes) => api.post('/reviews/bulk-reject', { reviewIds, notes }),
  reportReview: (id, data) => api.post(`/reviews/${id}/report`, data),
}

export default api

