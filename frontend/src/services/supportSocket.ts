/**
 * Support Chat Socket Service - Real-time messaging with admin
 * Connects to backend Socket.io server when available (local dev)
 * Falls back to polling when socket unavailable (e.g. Vercel serverless)
 */

import { io, Socket } from 'socket.io-client';
import { getItem } from '../utils/AsyncStorage';

const SOCKET_PATH = '/socket.io';

/**
 * Get socket server URL from API base URL (strip /api suffix)
 * Uses same base as axios - localhost:4000 for local, Vercel URL for prod
 */
export const getSocketServerURL = (): string => {
  const { getBaseURL } = require('./axios');
  const apiBase = getBaseURL();
  if (apiBase.includes('/api')) {
    return apiBase.replace(/\/api\/?$/, '');
  }
  return apiBase;
};

let socketInstance: Socket | null = null;

export interface SupportNewMessagePayload {
  conversationId: string;
  message: {
    _id: string;
    conversationId: string;
    sender: 'user' | 'support';
    text?: string;
    attachments?: Array<{ type: string; url: string; filename?: string }>;
    createdAt: string;
  };
}

export interface SupportStatusUpdatedPayload {
  conversationId: string;
  status: string;
}

/**
 * Connect to support socket (user role)
 * Call when entering SupportScreen
 */
export const connectSupportSocket = async (
  onNewMessage?: (payload: SupportNewMessagePayload) => void,
  onStatusUpdated?: (payload: SupportStatusUpdatedPayload) => void
): Promise<Socket | null> => {
  if (socketInstance?.connected) {
    return socketInstance;
  }

  try {
    const token = await getItem('token');
    if (!token) return null;

    const socketURL = getSocketServerURL();
    if (socketURL.includes('vercel.app')) {
      return null;
    }

    const socket = io(socketURL, {
      path: SOCKET_PATH,
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socket.on('connect', () => {});
    socket.on('connect_error', () => {});
    socket.on('disconnect', () => {});

    if (onNewMessage) {
      socket.on('support:new_message', onNewMessage);
    }
    if (onStatusUpdated) {
      socket.on('support:status_updated', onStatusUpdated);
    }

    socketInstance = socket;
    return socket;
  } catch {
    return null;
  }
};

/**
 * Disconnect support socket
 * Call when leaving SupportScreen
 */
export const disconnectSupportSocket = (): void => {
  if (socketInstance) {
    socketInstance.removeAllListeners();
    socketInstance.disconnect();
    socketInstance = null;
  }
};

/**
 * Check if socket is connected
 */
export const isSupportSocketConnected = (): boolean => {
  return !!socketInstance?.connected;
};
