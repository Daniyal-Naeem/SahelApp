/**
 * Admin Support Socket - Real-time notifications when users send messages
 */

import { io } from 'socket.io-client'

const getSocketServerURL = () => {
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
  return apiBase.replace(/\/api\/?$/, '')
}

let socketInstance = null

export const connectAdminSupportSocket = (onUserMessage) => {
  const token = localStorage.getItem('admin_token')
  if (!token) return null

  const socketURL = getSocketServerURL()
  if (socketURL.includes('vercel.app')) return null
  if (!socketURL || socketURL.includes('undefined')) return null

  if (socketInstance?.connected) {
    return socketInstance
  }

  try {
    const socket = io(socketURL, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 3,
    })

    socket.on('support:user_message', onUserMessage)
    socketInstance = socket
    return socket
  } catch {
    return null
  }
}

export const disconnectAdminSupportSocket = () => {
  if (socketInstance) {
    socketInstance.removeAllListeners()
    socketInstance.disconnect()
    socketInstance = null
  }
}

export const isAdminSupportSocketConnected = () => !!socketInstance?.connected
