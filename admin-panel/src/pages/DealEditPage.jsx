import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { dealAPI, categoryAPI, productAPI } from '../services/api'
import './DealEditPage.css'

const DealEditPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'weekly',
    discount: '',
    discountAmount: '',
    categories: [],
    products: [],
    minPurchase: '',
    maxDiscount: '',
    isActive: true,
    startDate: '',
    endDate: '',
    maxUses: ''
  })

  useEffect(() => {
    fetchDeal()
    fetchCategories()
    fetchProducts()
  }, [id])

  const fetchDeal = async () => {
    try {
      setFetchLoading(true)
      const response = await dealAPI.getDealById(id)
      const deal = response.data

      setFormData({
        title: deal.title || '',
        description: deal.description || '',
        type: deal.type || 'weekly',
        discount: deal.discount || '',
        discountAmount: deal.discountAmount || '',
        categories: deal.categories?.map(cat => cat._id) || [],
        products: deal.products?.map(prod => prod._id) || [],
        minPurchase: deal.minPurchase || '',
        maxDiscount: deal.maxDiscount || '',
        isActive: deal.isActive !== undefined ? deal.isActive : true,
        startDate: deal.startDate ? new Date(deal.startDate).toISOString().split('T')[0] : '',
        endDate: deal.endDate ? new Date(deal.endDate).toISOString().split('T')[0] : '',
        maxUses: deal.maxUses || ''
      })
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load deal')
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

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAllProducts()
      setProducts(response.data)
    } catch (err) {
      console.error('Failed to load products:', err)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      const dealData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        discount: formData.discount ? parseFloat(formData.discount) : undefined,
        discountAmount: formData.discountAmount ? parseFloat(formData.discountAmount) : undefined,
        categories: formData.categories,
        products: formData.products,
        minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : undefined,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
        isActive: formData.isActive,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined
      }

      await dealAPI.updateDeal(id, dealData)
      alert('Deal updated successfully!')
      navigate('/deals')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update deal')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return <div className="loading">Loading deal details...</div>
  }

  return (
    <div className="deal-edit-page">
      <div className="page-header">
        <h2>Edit Deal</h2>
        <button onClick={() => navigate('/deals')} className="btn-back">
          ← Back to Deals
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="deal-form">
        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="title">Deal Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter deal title"
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
              placeholder="Enter deal description"
              rows="3"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="type">Deal Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="daily">Daily</option>
              <option value="flash">Flash Sale</option>
              <option value="under_price">Under Price</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="isActive">Active</label>
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="discount">Discount (%)</label>
            <input
              type="number"
              id="discount"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.01"
              placeholder="10"
            />
          </div>

          <div className="form-group">
            <label htmlFor="discountAmount">Fixed Discount ($)</label>
            <input
              type="number"
              id="discountAmount"
              name="discountAmount"
              value={formData.discountAmount}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="5.00"
            />
          </div>
        </div>

        <div className="form-row">
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

          <div className="form-group">
            <label htmlFor="maxDiscount">Max Discount ($)</label>
            <input
              type="number"
              id="maxDiscount"
              name="maxDiscount"
              value={formData.maxDiscount}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="50"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date *</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date *</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
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
              min="0"
              placeholder="Unlimited"
            />
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
                    checked={formData.categories.includes(category._id)}
                    onChange={(e) => handleArrayChange('categories', category._id, e.target.checked)}
                  />
                  {category.name}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label>Applicable Products</label>
            <div className="checkbox-group">
              {products.slice(0, 20).map(product => ( // Limit to first 20 for performance
                <label key={product._id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.products.includes(product._id)}
                    onChange={(e) => handleArrayChange('products', product._id, e.target.checked)}
                  />
                  {product.title}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/deals')} className="btn-cancel">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Updating...' : 'Update Deal'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default DealEditPage
