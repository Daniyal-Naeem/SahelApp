import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productAPI, categoryAPI } from '../services/api'
import './ProductEditPage.css'

const ProductEditPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState([])
  const [productImageUploadType, setProductImageUploadType] = useState('url')
  const [uploadedProductImages, setUploadedProductImages] = useState([])
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
    fetchProduct()
    fetchCategories()
  }, [id])

  const fetchProduct = async () => {
    try {
      setFetchLoading(true)
      const response = await productAPI.getProductById(id)
      const product = response.data

      // Determine if images are URLs or base64
      const hasBase64Images = product.image?.some(img => img.startsWith('data:'))
      const hasUrlImages = product.image?.some(img => !img.startsWith('data:'))

      if (hasBase64Images && !hasUrlImages) {
        // All images are base64
        setProductImageUploadType('file')
        setUploadedProductImages(product.image || [])
        setFormData(prev => ({ ...prev, image: '' }))
      } else if (hasUrlImages && !hasBase64Images) {
        // All images are URLs
        setProductImageUploadType('url')
        setFormData(prev => ({ ...prev, image: (product.image || []).join(', ') }))
        setUploadedProductImages([])
      } else {
        // Mixed or empty
        setProductImageUploadType('url')
        const urlImages = (product.image || []).filter(img => !img.startsWith('data:'))
        setFormData(prev => ({ ...prev, image: urlImages.join(', ') }))
        setUploadedProductImages((product.image || []).filter(img => img.startsWith('data:')))
      }

      setFormData(prev => ({
        ...prev,
        title: product.title || '',
        description: product.description || '',
        price: product.price || '',
        priceBeforeDeal: product.priceBeforeDeal || '',
        priceOff: product.priceOff || '',
        category: product.category?._id || '',
        ukSide: (product.ukSide || []).join(', '),
        tags: (product.tags || []).join(', '),
        statusIcon: product.status?.icon || '🔥',
        statusName: product.status?.name || 'Hot'
      }))
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load product')
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleProductImageFileChange = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const validFiles = []
    const base64Images = []

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        alert(`File "${file.name}" is not an image. Please select image files only.`)
        continue
      }

      if (file.size > 5 * 1024 * 1024) {
        alert(`Image "${file.name}" is too large. Maximum size is 5MB per image.`)
        continue
      }

      validFiles.push(file)
    }

    if (validFiles.length === 0) return

    try {
      const promises = validFiles.map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      })

      const base64Results = await Promise.all(promises)
      base64Images.push(...base64Results)

      setUploadedProductImages(prev => [...prev, ...base64Images])
    } catch (error) {
      console.error('Error reading files:', error)
      alert('Failed to read image files')
    }
  }

  const handleProductImageUrlChange = (e) => {
    const value = e.target.value
    setFormData(prev => ({
      ...prev,
      image: value
    }))
  }

  const clearProductImages = () => {
    setFormData(prev => ({
      ...prev,
      image: ''
    }))
    setUploadedProductImages([])
  }

  const removeProductImage = (index) => {
    const newImages = uploadedProductImages.filter((_, i) => i !== index)
    setUploadedProductImages(newImages)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Handle images - combine uploaded files and URLs
      let images = []

      // Add uploaded images (base64)
      if (uploadedProductImages.length > 0) {
        images.push(...uploadedProductImages)
      }

      // Add URL images (comma-separated)
      if (formData.image.trim()) {
        const urlImages = formData.image
          .split(',')
          .map(img => img.trim())
          .filter(img => img)
        images.push(...urlImages)
      }

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
        ...(formData.category && formData.category !== '' && { category: formData.category })
      }

      await productAPI.updateProduct(id, productData)
      alert('Product updated successfully!')
      navigate(`/products/${id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update product')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return <div className="loading">Loading product details...</div>
  }

  return (
    <div className="product-edit-page">
      <div className="page-header">
        <h2>Edit Product</h2>
        <button onClick={() => navigate(`/products/${id}`)} className="btn-back">
          ← Back to Product Details
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="product-form">
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
              rows="4"
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
            <label htmlFor="category">Category</label>
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
          </div>

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

        <div className="form-row">
          <div className="form-group full-width">
            <label htmlFor="image">Product Images *</label>
            <div className="image-upload-tabs">
              <button
                type="button"
                className={`upload-tab ${productImageUploadType === 'url' ? 'active' : ''}`}
                onClick={() => {
                  setProductImageUploadType('url')
                  setUploadedProductImages([])
                }}
              >
                URLs
              </button>
              <button
                type="button"
                className={`upload-tab ${productImageUploadType === 'file' ? 'active' : ''}`}
                onClick={() => {
                  setProductImageUploadType('file')
                  setFormData(prev => ({ ...prev, image: '' }))
                }}
              >
                Upload Files
              </button>
            </div>

            {productImageUploadType === 'url' ? (
              <div className="image-url-input">
                <input
                  type="text"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleProductImageUrlChange}
                  required
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                />
                {formData.image && (
                  <button
                    type="button"
                    onClick={clearProductImages}
                    className="btn-clear-image"
                    title="Clear images"
                  >
                    ×
                  </button>
                )}
              </div>
            ) : (
              <div className="image-file-input">
                <input
                  type="file"
                  id="productImages"
                  accept="image/*"
                  multiple
                  onChange={handleProductImageFileChange}
                  className="file-input"
                />
                <label htmlFor="productImages" className="file-input-label">
                  <span className="file-input-text">
                    {uploadedProductImages.length > 0
                      ? `${uploadedProductImages.length} image(s) selected`
                      : 'Choose Image Files'}
                  </span>
                  <span className="file-input-button">Browse</span>
                </label>
                {uploadedProductImages.length > 0 && (
                  <button
                    type="button"
                    onClick={clearProductImages}
                    className="btn-clear-image"
                    title="Clear all images"
                  >
                    ×
                  </button>
                )}
              </div>
            )}

            {uploadedProductImages.length > 0 && (
              <div className="uploaded-images-preview">
                <h4>Uploaded Images Preview:</h4>
                <div className="images-grid">
                  {uploadedProductImages.map((image, index) => (
                    <div key={index} className="image-preview-item">
                      <img
                        src={image}
                        alt={`Product image ${index + 1}`}
                        className="image-preview"
                      />
                      <button
                        type="button"
                        onClick={() => removeProductImage(index)}
                        className="btn-remove-image"
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

        <div className="form-actions">
          <button type="button" onClick={() => navigate(`/products/${id}`)} className="btn-cancel">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Updating...' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductEditPage
