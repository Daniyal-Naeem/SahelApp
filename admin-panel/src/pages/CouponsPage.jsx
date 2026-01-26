import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { couponAPI } from '../services/api'
import './CouponsPage.css'

const CouponsPage = () => {
  const navigate = useNavigate()
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const response = await couponAPI.getAllCoupons()
      setCoupons(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (couponId) => {
    if (!window.confirm('Are you sure you want to deactivate this coupon?')) return
    
    try {
      await couponAPI.deleteCoupon(couponId)
      fetchCoupons()
      alert('Coupon deactivated successfully!')
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to deactivate coupon')
    }
  }

  const handleToggleActive = async (coupon) => {
    try {
      await couponAPI.updateCoupon(coupon._id, { isActive: !coupon.isActive })
      fetchCoupons()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update coupon')
    }
  }

  const isActive = (coupon) => {
    const now = new Date()
    return coupon.isActive && 
           new Date(coupon.startsAt) <= now && 
           (!coupon.expiresAt || new Date(coupon.expiresAt) >= now)
  }

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code?.toLowerCase().includes(search.toLowerCase()) ||
    coupon.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="coupons-page">
      <div className="page-header">
        <h1>Coupons</h1>
        <button onClick={() => navigate('/coupons/create')} className="btn-create">
          + Create Coupon
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by code or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading coupons...</div>
      ) : (
        <div className="coupons-table-container">
          <table className="coupons-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Discount</th>
                <th>Min Purchase</th>
                <th>Uses</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">No coupons found</td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => (
                  <tr key={coupon._id}>
                    <td className="code-cell">
                      <code>{coupon.code}</code>
                    </td>
                    <td>{coupon.name}</td>
                    <td>
                      {coupon.discountType === 'percentage' 
                        ? `${coupon.discountValue}%` 
                        : `$${coupon.discountValue}`}
                      {coupon.maxDiscount && ` (max $${coupon.maxDiscount})`}
                    </td>
                    <td>${coupon.minPurchase || 0}</td>
                    <td>{coupon.currentUses || 0} / {coupon.maxUses || '∞'}</td>
                    <td>
                      {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td>
                      <span className={`status-badge ${isActive(coupon) ? 'active' : 'inactive'}`}>
                        {isActive(coupon) ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleToggleActive(coupon)}
                          className={`btn-toggle ${coupon.isActive ? 'btn-deactivate' : 'btn-activate'}`}
                        >
                          {coupon.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => navigate(`/coupons/${coupon._id}/edit`)}
                          className="btn-edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id)}
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

export default CouponsPage















