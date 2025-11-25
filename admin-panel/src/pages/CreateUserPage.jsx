import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminAPI } from '../services/api'
import './CreateUserPage.css'

const CreateUserPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user',
    credits: 0,
    businessName: '',
    businessAddress: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'credits' ? parseFloat(value) || 0 : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || '',
        role: formData.role,
        ...(formData.role === 'vendor' && {
          businessName: formData.businessName || '',
          businessAddress: formData.businessAddress || ''
        })
      }

      const response = await adminAPI.createUser(userData)
      
      // If credits are specified, add them
      if (formData.credits > 0) {
        try {
          await adminAPI.addCredits?.(response.data.user._id, formData.credits, 'Initial credits')
        } catch (creditError) {
          console.warn('Could not add credits:', creditError)
        }
      }

      alert('User created successfully!')
      navigate('/users')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-page">
      <div className="create-header">
        <h2>Create New User</h2>
        <button onClick={() => navigate('/users')} className="btn-back">
          ← Back to Users
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="create-form">
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
              placeholder="user@example.com"
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

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="role">Role *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="user">User</option>
              <option value="vendor">Vendor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="credits">Initial Credits</label>
            <input
              type="number"
              id="credits"
              name="credits"
              value={formData.credits}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0"
            />
          </div>
        </div>

        {formData.role === 'vendor' && (
          <div className="vendor-fields">
            <h3>Vendor Information (Optional)</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="businessName">Business Name</label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={formData.businessName || ''}
                  onChange={handleChange}
                  placeholder="My Business"
                />
              </div>
              <div className="form-group">
                <label htmlFor="businessAddress">Business Address</label>
                <input
                  type="text"
                  id="businessAddress"
                  name="businessAddress"
                  value={formData.businessAddress || ''}
                  onChange={handleChange}
                  placeholder="123 Main St, City"
                />
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/users')} className="btn-cancel">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateUserPage

