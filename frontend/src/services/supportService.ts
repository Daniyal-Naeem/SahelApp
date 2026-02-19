import axios from './axios';

// Support conversation type
export interface SupportConversation {
  _id: string;
  userId: string;
  subject?: string;
  status: 'open' | 'closed' | 'pending';
  messages: SupportMessage[];
  createdAt: string;
  updatedAt: string;
}

// Support message type
export interface SupportMessage {
  _id: string;
  conversationId: string;
  sender: 'user' | 'support';
  text?: string;
  attachments?: SupportAttachment[];
  createdAt: string;
}

// Support attachment type
export interface SupportAttachment {
  _id: string;
  type: 'image' | 'file';
  url: string;
  filename?: string;
  size?: number;
}

// Create conversation payload
export interface CreateConversationPayload {
  subject?: string;
  initialMessage: string;
  attachments?: Array<{
    uri?: string;
    path?: string;
    type?: string;
    filename?: string;
  }>;
}

// Send message payload
export interface SendMessagePayload {
  text: string;
  attachments?: Array<{
    uri?: string;
    path?: string;
    type?: string;
    filename?: string;
  }>;
}

/**
 * Get all support conversations for the current user (requires authentication)
 */
export const getConversations = async (): Promise<SupportConversation[]> => {
  try {
    const res = await axios.get('/support/conversations');
    return res.data.conversations || res.data || [];
  } catch (error: any) {
    throw error;
  }
};

/**
 * Get single conversation with messages (requires authentication)
 */
export const getConversation = async (conversationId: string): Promise<SupportConversation> => {
  try {
    const res = await axios.get(`/support/conversations/${conversationId}`);
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Create a new support conversation (requires authentication)
 */
export const createConversation = async (
  payload: CreateConversationPayload
): Promise<SupportConversation> => {
  try {
    const formData = new FormData();
    formData.append('initialMessage', payload.initialMessage);
    if (payload.subject) {
      formData.append('subject', payload.subject);
    }
    if (payload.attachments) {
      payload.attachments.forEach((file) => {
        // React Native FormData format
        formData.append('attachments', {
          uri: file.uri || file.path,
          type: file.type || 'image/jpeg',
          name: file.filename || 'image.jpg',
        } as any);
      });
    }

    const res = await axios.post('/support/conversations', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.conversation || res.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Send a message in a conversation (requires authentication)
 */
export const sendMessage = async (
  conversationId: string,
  payload: SendMessagePayload
): Promise<SupportMessage> => {
  try {
    const formData = new FormData();
    formData.append('text', payload.text);
    if (payload.attachments) {
      payload.attachments.forEach((file) => {
        // React Native FormData format
        formData.append('attachments', {
          uri: file.uri || file.path,
          type: file.type || 'image/jpeg',
          name: file.filename || 'image.jpg',
        } as any);
      });
    }

    const res = await axios.post(
      `/support/conversations/${conversationId}/messages`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data.messageData || res.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Upload attachment to a conversation (requires authentication)
 */
export const uploadAttachment = async (
  conversationId: string,
  file: File
): Promise<SupportAttachment> => {
  try {
    const formData = new FormData();
    formData.append('file', file as any);

    const res = await axios.post(
      `/support/conversations/${conversationId}/attachments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Mark conversation as read (requires authentication)
 */
export const markConversationAsRead = async (conversationId: string): Promise<void> => {
  try {
    await axios.put(`/support/conversations/${conversationId}/read`);
  } catch (error: any) {
    throw error;
  }
};


