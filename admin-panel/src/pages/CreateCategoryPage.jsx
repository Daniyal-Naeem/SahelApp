import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { categoryAPI } from '../services/api'
import './CreateCategoryPage.css'

const CreateCategoryPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    icon: '',
    displayOrder: 0
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'displayOrder' ? parseInt(value) || 0 : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const categoryData = {
        name: formData.name,
        description: formData.description || '',
        image: formData.image || '',
        icon: formData.icon || '',
        displayOrder: formData.displayOrder || 0
      }

      const response = await categoryAPI.createCategory(categoryData)
      alert('Category created successfully!')
      navigate('/products/create', { 
        state: { newCategoryId: response.data._id } 
      })
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create category')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-page">
      <div className="create-header">
        <h2>Create New Category</h2>
        <button onClick={() => navigate('/products/create')} className="btn-back">
          ← Back to Create Product
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="create-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Category Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Electronics"
            />
          </div>

          <div className="form-group">
            <label htmlFor="displayOrder">Display Order</label>
            <input
              type="number"
              id="displayOrder"
              name="displayOrder"
              value={formData.displayOrder}
              onChange={handleChange}
              min="0"
              placeholder="0"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Category description"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="image">Image URL</label>
            <input
              type="url"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/category.jpg"
            />
          </div>

          <div className="form-group">
            <label htmlFor="icon">Icon (Emoji or Text)</label>
            <input
              type="text"
              id="icon"
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              placeholder="📱"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/products/create')} className="btn-cancel">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Creating...' : 'Create Category'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateCategoryPage

