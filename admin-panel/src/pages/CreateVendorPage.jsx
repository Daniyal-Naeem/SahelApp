import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminAPI } from '../services/api'
import './CreateVendorPage.css'

const CreateVendorPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    businessName: '',
    businessAddress: '',
    vendorStatus: 'pending'
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const vendorData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || '',
        role: 'vendor',
        businessName: formData.businessName || '',
        businessAddress: formData.businessAddress || '',
        vendorStatus: formData.vendorStatus
      }

      await adminAPI.createUser(vendorData)
      alert('Vendor created successfully!')
      navigate('/vendors')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create vendor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-page">
      <div className="create-header">
        <h2>Create New Vendor</h2>
        <button onClick={() => navigate('/vendors')} className="btn-back">
          ← Back to Vendors
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="create-form">
        <h3 className="section-title">Personal Information</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="vendor@example.com"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Minimum 6 characters"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1234567890"
            />
          </div>
        </div>

        <h3 className="section-title">Business Information</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="businessName">Business Name *</label>
            <input
              type="text"
              id="businessName"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              required
              placeholder="My Business Store"
            />
          </div>

          <div className="form-group">
            <label htmlFor="businessAddress">Business Address *</label>
            <input
              type="text"
              id="businessAddress"
              name="businessAddress"
              value={formData.businessAddress}
              onChange={handleChange}
              required
              placeholder="123 Main St, City, State"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="vendorStatus">Vendor Status *</label>
            <select
              id="vendorStatus"
              name="vendorStatus"
              value={formData.vendorStatus}
              onChange={handleChange}
              required
            >
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <small className="form-hint">
              Select "Approved" to automatically approve this vendor
            </small>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/vendors')} className="btn-cancel">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Creating...' : 'Create Vendor'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateVendorPage


