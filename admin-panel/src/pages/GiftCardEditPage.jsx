import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { giftCardAPI, categoryAPI, adminAPI } from '../services/api'
import './GiftCardEditPage.css'

const GiftCardEditPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState([])
  const [vendors, setVendors] = useState([])
  const [formData, setFormData] = useState({
    code: '',
    amount: '',
    currency: 'USD',
    type: 'digital',
    status: 'active',
    assignedTo: '',
    expiresAt: '',
    maxUses: '',
    applicableCategories: [],
    applicableVendors: [],
    minPurchase: ''
  })

  useEffect(() => {
    fetchGiftCard()
    fetchCategories()
    fetchVendors()
  }, [id])

  const fetchGiftCard = async () => {
    try {
      setFetchLoading(true)
      const response = await giftCardAPI.getGiftCardById(id)
      const giftCard = response.data

      setFormData({
        code: giftCard.code || '',
        amount: giftCard.amount || '',
        currency: giftCard.currency || 'USD',
        type: giftCard.type || 'digital',
        status: giftCard.status || 'active',
        assignedTo: giftCard.assignedTo?._id || '',
        expiresAt: giftCard.expiresAt ? new Date(giftCard.expiresAt).toISOString().split('T')[0] : '',
        maxUses: giftCard.maxUses || '',
        applicableCategories: giftCard.applicableCategories?.map(cat => cat._id) || [],
        applicableVendors: giftCard.applicableVendors?.map(vendor => vendor._id) || [],
        minPurchase: giftCard.minPurchase || ''
      })
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load gift card')
    } finally {
      setFetchLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAllCategories()
      setCategories(response.data)
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  const fetchVendors = async () => {
    try {
      const response = await adminAPI.getAllVendors()
      setVendors(response.data.vendors || [])
    } catch (err) {
      console.error('Failed to load vendors:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleArrayChange = (name, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
        ? [...prev[name], value]
        : prev[name].filter(item => item !== value)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const giftCardData = {
        code: formData.code.toUpperCase().trim(),
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        type: formData.type,
        status: formData.status,
        assignedTo: formData.assignedTo || undefined,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
        applicableCategories: formData.applicableCategories,
        applicableVendors: formData.applicableVendors,
        minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : undefined
      }

      await giftCardAPI.updateGiftCard(id, giftCardData)
      alert('Gift card updated successfully!')
      navigate('/gift-cards')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update gift card')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return <div className="loading">Loading gift card details...</div>
  }

  return (
    <div className="gift-card-edit-page">
      <div className="page-header">
        <h2>Edit Gift Card</h2>
        <button onClick={() => navigate('/gift-cards')} className="btn-back">
          ← Back to Gift Cards
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="gift-card-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="code">Gift Card Code *</label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              placeholder="GC-XXXX-XXXX-XXXX"
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount *</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="50.00"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="currency">Currency *</label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              required
            >
              <option value="USD">USD ($)</option>
              <option value="SAR">SAR (﷼)</option>
              <option value="AED">AED (د.إ)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="type">Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="digital">Digital</option>
              <option value="physical">Physical</option>
              <option value="libre_bundle">Libre Bundle</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="active">Active</option>
              <option value="redeemed">Redeemed</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="expiresAt">Expiry Date</label>
            <input
              type="date"
              id="expiresAt"
              name="expiresAt"
              value={formData.expiresAt}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="maxUses">Max Uses</label>
            <input
              type="number"
              id="maxUses"
              name="maxUses"
              value={formData.maxUses}
              onChange={handleChange}
              min="1"
              placeholder="1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="minPurchase">Min Purchase ($)</label>
            <input
              type="number"
              id="minPurchase"
              name="minPurchase"
              value={formData.minPurchase}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="assignedTo">Assigned To (User)</label>
            <input
              type="text"
              id="assignedTo"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              placeholder="User ID (leave empty if not assigned)"
            />
            <small className="form-help">Enter user ID to assign this gift card to a specific user</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label>Applicable Categories</label>
            <div className="checkbox-group">
              {categories.map(category => (
                <label key={category._id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.applicableCategories.includes(category._id)}
                    onChange={(e) => handleArrayChange('applicableCategories', category._id, e.target.checked)}
                  />
                  {category.name}
                </label>
              ))}
            </div>
            <small className="form-help">Leave empty for all categories</small>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label>Applicable Vendors</label>
            <div className="checkbox-group">
              {vendors.map(vendor => (
                <label key={vendor._id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.applicableVendors.includes(vendor._id)}
                    onChange={(e) => handleArrayChange('applicableVendors', vendor._id, e.target.checked)}
                  />
                  {vendor.name} ({vendor.businessName || 'No business name'})
                </label>
              ))}
            </div>
            <small className="form-help">Leave empty for all vendors</small>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/gift-cards')} className="btn-cancel">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Updating...' : 'Update Gift Card'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default GiftCardEditPage
