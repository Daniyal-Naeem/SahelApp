import { useState } from 'react'
import { creditAdminAPI } from '../services/api'
import './CreditAdjustPage.css'

const CreditAdjustPage = () => {
  const [formData, setFormData] = useState({
    userId: '',
    amount: '',
    reason: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (!formData.userId || !formData.amount || !formData.reason) {
        throw new Error('All fields are required')
      }

      const amount = parseFloat(formData.amount)
      if (isNaN(amount) || amount === 0) {
        throw new Error('Amount must be a valid number (positive or negative)')
      }

      await creditAdminAPI.adjustCredit(
        formData.userId,
        amount,
        formData.reason
      )

      setSuccess(`Credit adjustment of ${amount > 0 ? '+' : ''}${amount} completed successfully`)
      setFormData({ userId: '', amount: '', reason: '' })
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to adjust credit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="credit-adjust-page">
      <div className="page-header">
        <h1>Manual Credit Adjustment</h1>
        <p className="page-subtitle">Adjust user credit balance manually (with audit log)</p>
      </div>

      <div className="adjust-form-container">
        <form onSubmit={handleSubmit} className="adjust-form">
          <div className="form-group">
            <label htmlFor="userId">User ID *</label>
            <input
              type="text"
              id="userId"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              placeholder="Enter user ID"
              required
              className="form-input"
            />
            <small>Enter the MongoDB user ID</small>
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount *</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount (positive to add, negative to deduct)"
              step="0.01"
              required
              className="form-input"
            />
            <small>Positive value adds credits, negative value deducts credits</small>
          </div>

          <div className="form-group">
            <label htmlFor="reason">Reason *</label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Enter reason for adjustment (required for audit)"
              rows="4"
              required
              className="form-textarea"
            />
            <small>This reason will be logged in the audit trail</small>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button
            type="submit"
            disabled={loading}
            className="btn-submit"
          >
            {loading ? 'Processing...' : 'Adjust Credit'}
          </button>
        </form>

        <div className="info-box">
          <h3>Important Notes:</h3>
          <ul>
            <li>All adjustments are logged in the audit trail</li>
            <li>Positive amounts add credits to the user's balance</li>
            <li>Negative amounts deduct credits from the user's balance</li>
            <li>You cannot deduct more than the user's current balance</li>
            <li>This action cannot be undone</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default CreditAdjustPage















