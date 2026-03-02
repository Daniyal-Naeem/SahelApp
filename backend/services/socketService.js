/**
 * Socket.io service - Centralized socket instance for real-time support chat
 * Used by support controller and admin controller to emit events
 */

let ioInstance = null

/**
 * Set the Socket.io instance (called from server initialization)
 */
const setSocketIO = (io) => {
    ioInstance = io
}

/**
 * Get the Socket.io instance (may be null if running on serverless/Vercel)
 */
const getSocketIO = () => {
    return ioInstance
}

module.exports = {
    setSocketIO,
    getSocketIO
}
