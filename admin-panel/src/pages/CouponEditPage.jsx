import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { couponAPI, categoryAPI, productAPI, adminAPI } from '../services/api'
import './CouponEditPage.css'

const CouponEditPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [vendors, setVendors] = useState([])
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    maxDiscount: '',
    minPurchase: '',
    isActive: true,
    expiresAt: '',
    startsAt: '',
    maxUses: '',
    maxUsesPerUser: '',
    applicableCategories: [],
    applicableProducts: [],
    excludedCategories: [],
    excludedProducts: [],
    applicableVendors: []
  })

  useEffect(() => {
    fetchCoupon()
    fetchCategories()
    fetchProducts()
    fetchVendors()
  }, [id])

  const fetchCoupon = async () => {
    try {
      setFetchLoading(true)
      const response = await couponAPI.getCouponByCode(id)
      const coupon = response.data

      setFormData({
        code: coupon.code || '',
        name: coupon.name || '',
        description: coupon.description || '',
        discountType: coupon.discountType || 'percentage',
        discountValue: coupon.discountValue || '',
        maxDiscount: coupon.maxDiscount || '',
        minPurchase: coupon.minPurchase || '',
        isActive: coupon.isActive !== undefined ? coupon.isActive : true,
        expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '',
        startsAt: coupon.startsAt ? new Date(coupon.startsAt).toISOString().split('T')[0] : '',
        maxUses: coupon.maxUses || '',
        maxUsesPerUser: coupon.maxUsesPerUser || '',
        applicableCategories: coupon.applicableCategories?.map(cat => cat._id) || [],
        applicableProducts: coupon.applicableProducts?.map(prod => prod._id) || [],
        excludedCategories: coupon.excludedCategories?.map(cat => cat._id) || [],
        excludedProducts: coupon.excludedProducts?.map(prod => prod._id) || [],
        applicableVendors: coupon.applicableVendors?.map(vendor => vendor._id) || []
      })
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load coupon')
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

  const fetchVendors = async () => {
    try {
      const response = await adminAPI.getAllVendors()
      setVendors(response.data.vendors || [])
    } catch (err) {
      console.error('Failed to load vendors:', err)
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
      const couponData = {
        code: formData.code.toUpperCase().trim(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
        minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : undefined,
        isActive: formData.isActive,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : undefined,
        startsAt: formData.startsAt ? new Date(formData.startsAt) : new Date(),
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
        maxUsesPerUser: formData.maxUsesPerUser ? parseInt(formData.maxUsesPerUser) : undefined,
        applicableCategories: formData.applicableCategories,
        applicableProducts: formData.applicableProducts,
        excludedCategories: formData.excludedCategories,
        excludedProducts: formData.excludedProducts,
        applicableVendors: formData.applicableVendors
      }

      await couponAPI.updateCoupon(id, couponData)
      alert('Coupon updated successfully!')
      navigate('/coupons')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update coupon')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return <div className="loading">Loading coupon details...</div>
  }

  return (
    <div className="coupon-edit-page">
      <div className="page-header">
        <h2>Edit Coupon</h2>
        <button onClick={() => navigate('/coupons')} className="btn-back">
          ← Back to Coupons
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="coupon-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="code">Coupon Code *</label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              placeholder="SUMMER2024"
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">Coupon Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Summer Sale 2024"
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
              placeholder="Coupon description"
              rows="2"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="discountType">Discount Type *</label>
            <select
              id="discountType"
              name="discountType"
              value={formData.discountType}
              onChange={handleChange}
              required
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount ($)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="discountValue">Discount Value *</label>
            <input
              type="number"
              id="discountValue"
              name="discountValue"
              value={formData.discountValue}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder={formData.discountType === 'percentage' ? '10' : '5.00'}
            />
          </div>
        </div>

        <div className="form-row">
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
              placeholder="50.00"
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
          <div className="form-group">
            <label htmlFor="startsAt">Start Date</label>
            <input
              type="date"
              id="startsAt"
              name="startsAt"
              value={formData.startsAt}
              onChange={handleChange}
            />
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
              min="0"
              placeholder="Unlimited"
            />
          </div>

          <div className="form-group">
            <label htmlFor="maxUsesPerUser">Max Uses Per User</label>
            <input
              type="number"
              id="maxUsesPerUser"
              name="maxUsesPerUser"
              value={formData.maxUsesPerUser}
              onChange={handleChange}
              min="1"
              placeholder="1"
            />
          </div>
        </div>

        <div className="form-row">
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
          </div>
        </div>

        <div className="form-row">
          <div className="form-group full-width">
            <label>Excluded Categories</label>
            <div className="checkbox-group">
              {categories.map(category => (
                <label key={category._id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.excludedCategories.includes(category._id)}
                    onChange={(e) => handleArrayChange('excludedCategories', category._id, e.target.checked)}
                  />
                  {category.name}
                </label>
              ))}
            </div>
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
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/coupons')} className="btn-cancel">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Updating...' : 'Update Coupon'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CouponEditPage
