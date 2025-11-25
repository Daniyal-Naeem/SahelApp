import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { productAPI, categoryAPI } from '../services/api'
import './CreateProductPage.css'

const CreateProductPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    priceBeforeDeal: '',
    priceOff: '',
    category: '',
    image: '',
    ukSide: '',
    tags: '',
    statusIcon: '🔥',
    statusName: 'Hot'
  })

  useEffect(() => {
    fetchCategories()
    // Check if we're returning from category creation
    if (location.state?.newCategoryId) {
      setFormData(prev => ({ ...prev, category: location.state.newCategoryId }))
    }
  }, [location])

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAllCategories()
      setCategories(response.data)
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

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
      // Parse images (comma-separated)
      const images = formData.image
        .split(',')
        .map(img => img.trim())
        .filter(img => img)

      // Parse UK sizes (comma-separated)
      const ukSides = formData.ukSide
        .split(',')
        .map(size => size.trim())
        .filter(size => size)

      // Parse tags (comma-separated)
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag)

      const productData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        priceBeforeDeal: parseFloat(formData.priceBeforeDeal),
        priceOff: parseFloat(formData.priceOff),
        image: images,
        ukSide: ukSides,
        tags: tags,
        status: {
          icon: formData.statusIcon,
          name: formData.statusName
        },
        stars: 0,
        numberOfReview: 0,
        ...(formData.category && formData.category !== '' && { category: formData.category })
      }

      await productAPI.createProduct(productData)
      alert('Product created successfully!')
      navigate('/products')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-page">
      <div className="create-header">
        <h2>Create New Product</h2>
        <button onClick={() => navigate('/products')} className="btn-back">
          ← Back to Products
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="create-form">
        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="title">Product Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter product title"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Enter product description"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <div className="category-select-wrapper">
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select Category (Optional)</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => navigate('/categories/create')}
                className="btn-create-category"
                title="Create new category"
              >
                + New
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="image">Images (comma-separated URLs) *</label>
            <input
              type="text"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              required
              placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Price *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="99.99"
            />
          </div>

          <div className="form-group">
            <label htmlFor="priceBeforeDeal">Price Before Deal *</label>
            <input
              type="number"
              id="priceBeforeDeal"
              name="priceBeforeDeal"
              value={formData.priceBeforeDeal}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="149.99"
            />
          </div>

          <div className="form-group">
            <label htmlFor="priceOff">Price Off (%) *</label>
            <input
              type="number"
              id="priceOff"
              name="priceOff"
              value={formData.priceOff}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="33"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="ukSide">UK Sizes (comma-separated)</label>
            <input
              type="text"
              id="ukSide"
              name="ukSide"
              value={formData.ukSide}
              onChange={handleChange}
              placeholder="S, M, L, XL"
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="summer, casual, trendy"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="statusIcon">Status Icon *</label>
            <input
              type="text"
              id="statusIcon"
              name="statusIcon"
              value={formData.statusIcon}
              onChange={handleChange}
              required
              placeholder="🔥"
            />
          </div>

          <div className="form-group">
            <label htmlFor="statusName">Status Name *</label>
            <input
              type="text"
              id="statusName"
              name="statusName"
              value={formData.statusName}
              onChange={handleChange}
              required
              placeholder="Hot"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/products')} className="btn-cancel">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateProductPage

