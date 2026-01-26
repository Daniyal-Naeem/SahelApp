import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { bannerAPI } from '../services/api'
import './CreateBannerPage.css'

const CreateBannerPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    targetUrl: '',
    type: 'slider',
    order: 0,
    isActive: true,
    startDate: '',
    endDate: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const bannerData = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        order: parseInt(formData.order) || 0
      }

      await bannerAPI.createBanner(bannerData)
      alert('Banner created successfully!')
      navigate('/banners')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create banner')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-banner-page">
      <div className="page-header">
        <h1>Create Banner</h1>
        <button onClick={() => navigate('/banners')} className="btn-back">
          ← Back to Banners
        </button>
      </div>

      <form onSubmit={handleSubmit} className="banner-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="form-textarea"
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Image URL *</label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="form-group">
          <label htmlFor="targetUrl">Target URL</label>
          <input
            type="url"
            id="targetUrl"
            name="targetUrl"
            value={formData.targetUrl}
            onChange={handleChange}
            className="form-input"
            placeholder="https://example.com"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="slider">Slider</option>
              <option value="promotional">Promotional</option>
              <option value="ad">Ad</option>
              <option value="deal">Deal</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="order">Display Order</label>
            <input
              type="number"
              id="order"
              name="order"
              value={formData.order}
              onChange={handleChange}
              min="0"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="datetime-local"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="datetime-local"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            Active
          </label>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/banners')} className="btn-cancel">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Creating...' : 'Create Banner'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateBannerPage















