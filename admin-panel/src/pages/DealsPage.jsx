import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { dealAPI } from '../services/api'
import './DealsPage.css'

const DealsPage = () => {
  const navigate = useNavigate()
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')

  useEffect(() => {
    fetchDeals()
  }, [])

  const fetchDeals = async () => {
    try {
      setLoading(true)
      const response = await dealAPI.getAllDeals()
      setDeals(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load deals')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (dealId) => {
    if (!window.confirm('Are you sure you want to delete this deal?')) return
    
    try {
      await dealAPI.deleteDeal(dealId)
      fetchDeals()
      alert('Deal deleted successfully!')
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete deal')
    }
  }

  const handleToggleActive = async (deal) => {
    try {
      await dealAPI.updateDeal(deal._id, { isActive: !deal.isActive })
      fetchDeals()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update deal')
    }
  }

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title?.toLowerCase().includes(search.toLowerCase())
    const matchesType = !filterType || deal.type === filterType
    return matchesSearch && matchesType
  })

  const isActive = (deal) => {
    const now = new Date()
    return deal.isActive && 
           new Date(deal.startDate) <= now && 
           new Date(deal.endDate) >= now
  }

  return (
    <div className="deals-page">
      <div className="page-header">
        <h1>Deals</h1>
        <button onClick={() => navigate('/deals/create')} className="btn-create">
          + Create Deal
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search deals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="filter-select"
        >
          <option value="">All Types</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="daily">Daily</option>
          <option value="flash">Flash</option>
          <option value="under_price">Under Price</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading deals...</div>
      ) : (
        <div className="deals-table-container">
          <table className="deals-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Discount</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Uses</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeals.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">No deals found</td>
                </tr>
              ) : (
                filteredDeals.map((deal) => (
                  <tr key={deal._id}>
                    <td>{deal.title}</td>
                    <td><span className="type-badge">{deal.type}</span></td>
                    <td>
                      {deal.discount ? `${deal.discount}%` : ''}
                      {deal.discountAmount ? `$${deal.discountAmount}` : ''}
                    </td>
                    <td>{new Date(deal.startDate).toLocaleDateString()}</td>
                    <td>{new Date(deal.endDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${isActive(deal) ? 'active' : 'inactive'}`}>
                        {isActive(deal) ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{deal.currentUses || 0} / {deal.maxUses || '∞'}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleToggleActive(deal)}
                          className={`btn-toggle ${deal.isActive ? 'btn-deactivate' : 'btn-activate'}`}
                        >
                          {deal.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => navigate(`/deals/${deal._id}/edit`)}
                          className="btn-edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(deal._id)}
                          className="btn-delete"
                        >
                          Delete
                        </button>
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

export default DealsPage

