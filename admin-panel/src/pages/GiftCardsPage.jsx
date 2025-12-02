import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { giftCardAPI } from '../services/api'
import './GiftCardsPage.css'

const GiftCardsPage = () => {
  const navigate = useNavigate()
  const [giftCards, setGiftCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    fetchGiftCards()
  }, [])

  const fetchGiftCards = async () => {
    try {
      setLoading(true)
      const response = await giftCardAPI.getAllGiftCards()
      setGiftCards(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load gift cards')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (giftCardId) => {
    if (!window.confirm('Are you sure you want to cancel this gift card?')) return
    
    try {
      await giftCardAPI.deleteGiftCard(giftCardId)
      fetchGiftCards()
      alert('Gift card cancelled successfully!')
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel gift card')
    }
  }

  const handleBulkCreate = () => {
    navigate('/gift-cards/bulk-create')
  }

  const filteredGiftCards = giftCards.filter(card => {
    const matchesSearch = card.code?.toLowerCase().includes(search.toLowerCase()) ||
                         card.assignedTo?.email?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !filterStatus || card.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="gift-cards-page">
      <div className="page-header">
        <h1>Gift Cards</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/gift-cards/create')} className="btn-create">
            + Create Gift Card
          </button>
          <button onClick={handleBulkCreate} className="btn-bulk">
            Bulk Create
          </button>
        </div>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by code or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="redeemed">Redeemed</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading gift cards...</div>
      ) : (
        <div className="gift-cards-table-container">
          <table className="gift-cards-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Expires At</th>
                <th>Redeemed At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGiftCards.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">No gift cards found</td>
                </tr>
              ) : (
                filteredGiftCards.map((card) => (
                  <tr key={card._id}>
                    <td className="code-cell">
                      <code>{card.code}</code>
                    </td>
                    <td>${card.amount} {card.currency}</td>
                    <td><span className="type-badge">{card.type}</span></td>
                    <td>
                      <span className={`status-badge status-${card.status}`}>
                        {card.status}
                      </span>
                    </td>
                    <td>{card.assignedTo?.email || 'Unassigned'}</td>
                    <td>
                      {card.expiresAt ? new Date(card.expiresAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td>
                      {card.redeemedAt ? new Date(card.redeemedAt).toLocaleDateString() : '-'}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => navigate(`/gift-cards/${card._id}/edit`)}
                          className="btn-edit"
                        >
                          Edit
                        </button>
                        {card.status === 'active' && (
                          <button
                            onClick={() => handleDelete(card._id)}
                            className="btn-delete"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default GiftCardsPage







