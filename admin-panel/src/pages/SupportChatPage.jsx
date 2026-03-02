import { useState, useEffect, useRef, useCallback } from 'react'
import { supportAdminAPI } from '../services/api'
import { connectAdminSupportSocket, disconnectAdminSupportSocket, isAdminSupportSocketConnected } from '../services/supportSocket'
import './SupportChatPage.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
const getServerBaseURL = () => API_BASE.replace(/\/api\/?$/, '')

const SupportChatPage = () => {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef(null)
  const pollingRef = useRef(null)

  const fetchConversations = useCallback(async () => {
    try {
      const res = await supportAdminAPI.getAllConversations()
      const data = res.data?.conversations ?? res.data ?? []
      setConversations(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchConversation = useCallback(async (id) => {
    if (!id) return
    try {
      const res = await supportAdminAPI.getConversation(id)
      const conv = res.data?.conversation ?? res.data
      setSelectedConversation(conv)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load conversation')
    }
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  useEffect(() => {
    const handleUserMessage = (payload) => {
      setConversations(prev => prev.map(c =>
        c._id === payload.conversationId ? { ...c, lastMessageAt: new Date() } : c
      ))
      if (selectedConversation?._id === payload.conversationId) {
        setSelectedConversation(prev => prev ? {
          ...prev,
          messages: [...(prev.messages || []), payload.message]
        } : prev)
      } else {
        fetchConversations()
      }
    }

    connectAdminSupportSocket(handleUserMessage)

    pollingRef.current = setInterval(() => {
      if (!isAdminSupportSocketConnected() && selectedConversation) {
        fetchConversation(selectedConversation._id)
      }
    }, 15000)

    return () => {
      disconnectAdminSupportSocket()
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [selectedConversation?._id, fetchConversation, fetchConversations])

  useEffect(() => {
    if (selectedConversation?._id) {
      fetchConversation(selectedConversation._id)
    } else {
      setSelectedConversation(null)
    }
  }, [selectedConversation?._id, fetchConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConversation?.messages])

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv)
    setError('')
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!messageText.trim() || !selectedConversation || sending) return

    setSending(true)
    try {
      await supportAdminAPI.sendMessage(selectedConversation._id, messageText.trim())
      const res = await supportAdminAPI.getConversation(selectedConversation._id)
      const conv = res.data?.conversation ?? res.data
      setSelectedConversation(conv)
      setMessageText('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleUpdateStatus = async (status) => {
    if (!selectedConversation) return
    try {
      await supportAdminAPI.updateStatus(selectedConversation._id, status)
      const res = await supportAdminAPI.getConversation(selectedConversation._id)
      setSelectedConversation(res.data?.conversation ?? res.data)
      fetchConversations()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status')
    }
  }

  const getImageUrl = (url) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${getServerBaseURL()}${url}`
  }

  const formatDate = (d) => {
    if (!d) return ''
    const date = new Date(d)
    const now = new Date()
    const diff = now - date
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="support-chat-page">
        <div className="support-loading">Loading support conversations...</div>
      </div>
    )
  }

  return (
    <div className="support-chat-page">
      <div className="support-header">
        <h1>Support Chat</h1>
        <span className="support-socket-badge">
          {isAdminSupportSocketConnected() ? '🟢 Real-time' : '🟡 Polling'}
        </span>
      </div>

      {error && (
        <div className="support-error" onClick={() => setError('')}>
          {error} (click to dismiss)
        </div>
      )}

      <div className="support-layout">
        <div className="support-conversation-list">
          {conversations.length === 0 ? (
            <div className="support-empty">No support conversations yet.</div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv._id}
                className={`support-conv-item ${selectedConversation?._id === conv._id ? 'active' : ''}`}
                onClick={() => handleSelectConversation(conv)}
              >
                <div className="support-conv-user">
                  {conv.user?.name || conv.user?.email || 'User'}
                </div>
                <div className="support-conv-subject">{conv.subject || 'Support'}</div>
                <div className="support-conv-meta">
                  <span className={`support-conv-status status-${conv.status}`}>{conv.status}</span>
                  <span className="support-conv-date">{formatDate(conv.lastMessageAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="support-chat-area">
          {!selectedConversation ? (
            <div className="support-select-prompt">Select a conversation to view and reply.</div>
          ) : (
            <>
              <div className="support-chat-header">
                <div>
                  <strong>{selectedConversation.user?.name || selectedConversation.user?.email || 'User'}</strong>
                  <span className="support-chat-email">{selectedConversation.user?.email}</span>
                </div>
                <div className="support-chat-actions">
                  <select
                    value={selectedConversation.status}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    className="support-status-select"
                  >
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="support-messages">
                {(selectedConversation.messages || []).map((msg) => (
                  <div
                    key={msg._id}
                    className={`support-msg support-msg-${msg.sender}`}
                  >
                    <div className="support-msg-bubble">
                      {msg.attachments?.map((a) =>
                        a.type === 'image' ? (
                          <img
                            key={a._id}
                            src={getImageUrl(a.url)}
                            alt="Attachment"
                            className="support-msg-image"
                          />
                        ) : null
                      )}
                      {msg.text && <p className="support-msg-text">{msg.text}</p>}
                      <span className="support-msg-time">{formatDate(msg.createdAt)}</span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {selectedConversation.status !== 'closed' && (
                <form className="support-input-form" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your reply..."
                    className="support-input"
                    disabled={sending}
                  />
                  <button type="submit" className="support-send-btn" disabled={sending || !messageText.trim()}>
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SupportChatPage
