import axios from './axios';

export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'system' | 'promotion' | 'vendor' | 'credit_transfer_sent' | 'credit_transfer_received' | 'other';
  isRead: boolean;
  readAt?: string;
  relatedEntity?: string;
  relatedEntityId?: string;
  actionUrl?: string;
  priority?: 'low' | 'medium' | 'high';
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationQueryParams {
  isRead?: boolean;
  type?: 'order' | 'payment' | 'system' | 'promotion' | 'vendor' | 'credit_transfer_sent' | 'credit_transfer_received' | 'other';
  limit?: number;
}

// Get user notifications (authenticated)
export const getUserNotifications = async (params?: NotificationQueryParams): Promise<Notification[]> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params) {
      if (params.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());
      if (params.type) queryParams.append('type', params.type);
      if (params.limit) queryParams.append('limit', params.limit.toString());
    }
    
    const queryString = queryParams.toString();
    const url = queryString ? `/notifications?${queryString}` : '/notifications';
    const res = await axios.get(url);
    return res.data || [];
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

// Get unread notification count (authenticated)
export const getUnreadCount = async (): Promise<number> => {
  try {
    const res = await axios.get('/notifications/unread-count');
    return res.data?.unreadCount || 0;
  } catch (error: any) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
};

// Mark notification as read (authenticated)
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    await axios.put(`/notifications/${notificationId}/read`);
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read (authenticated)
export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    await axios.put('/notifications/read-all');
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete notification (authenticated)
export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    await axios.delete(`/notifications/${notificationId}`);
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Format notification time for display
export const formatNotificationTime = (createdAt?: string): string => {
  if (!createdAt) return 'Just now';
  
  const now = new Date();
  const notificationDate = new Date(createdAt);
  const diffMs = now.getTime() - notificationDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  
  return notificationDate.toLocaleDateString();
};

