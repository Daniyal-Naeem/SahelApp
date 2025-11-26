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
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    image: '',
    icon: '',
    displayOrder: 0
  })
  const [imageUploadType, setImageUploadType] = useState('url') // 'url' or 'file'
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null)
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

  const handleEditCategory = (category) => {
    setEditingCategory(category)
    setCategoryFormData({
      name: category.name || '',
      description: category.description || '',
      image: category.image || '',
      icon: category.icon || '',
      displayOrder: category.displayOrder || 0
    })
    setImageUploadType(category.image ? 'url' : 'url')
    setUploadedImagePreview(category.image || null)
    setShowCategoryManager(true)
  }

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return
    }

    try {
      await categoryAPI.deleteCategory(categoryId)
      alert('Category deleted successfully!')
      fetchCategories() // Refresh categories list
      // Clear selected category if it was deleted
      if (formData.category === categoryId) {
        setFormData(prev => ({ ...prev, category: '' }))
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete category')
    }
  }

  const handleCategoryFormChange = (e) => {
    const { name, value } = e.target
    setCategoryFormData(prev => ({
      ...prev,
      [name]: name === 'displayOrder' ? parseInt(value) || 0 : value
    }))
  }

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

    try {
      // Convert to base64 for preview and upload
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result
        setUploadedImagePreview(base64String)
        setCategoryFormData(prev => ({
          ...prev,
          image: base64String // Store base64 string
        }))
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error reading file:', error)
      alert('Failed to read image file')
    }
  }

  const handleImageUrlChange = (e) => {
    const value = e.target.value
    setCategoryFormData(prev => ({
      ...prev,
      image: value
    }))
    setUploadedImagePreview(value || null)
  }

  const clearImage = () => {
    setCategoryFormData(prev => ({
      ...prev,
      image: ''
    }))
    setUploadedImagePreview(null)
  }

  const handleCategorySubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    try {
      // Prepare category data
      // If image is base64 and too long, we might need to handle it differently
      let imageValue = categoryFormData.image || ''
      
      // If it's a base64 data URL and very long, consider truncating or using a service
      // For now, we'll send it as-is (backend should handle it)
      if (imageValue.startsWith('data:image/')) {
        // Base64 image - this is fine, backend accepts string
        console.log('Sending base64 image, length:', imageValue.length)
      }
      
      const categoryData = {
        name: categoryFormData.name.trim(),
        description: categoryFormData.description || '',
        image: imageValue,
        icon: categoryFormData.icon || '',
        displayOrder: categoryFormData.displayOrder || 0
      }

      console.log('Submitting category:', { editingCategory, categoryData })

      if (editingCategory) {
        // Update existing category
        console.log('Updating category:', editingCategory._id)
        const response = await categoryAPI.updateCategory(editingCategory._id, categoryData)
        console.log('Update response:', response)
        if (response && response.data) {
          alert('Category updated successfully!')
          fetchCategories() // Refresh categories list
          setShowCategoryManager(false)
          setEditingCategory(null)
          setCategoryFormData({
            name: '',
            description: '',
            image: '',
            icon: '',
            displayOrder: 0
          })
          setImageUploadType('url')
          setUploadedImagePreview(null)
        }
      } else {
        // Create new category
        console.log('Creating new category')
        const response = await categoryAPI.createCategory(categoryData)
        console.log('Create response:', response)
        if (response && response.data) {
          alert('Category created successfully!')
          setFormData(prev => ({ ...prev, category: response.data._id }))
          fetchCategories() // Refresh categories list
          setShowCategoryManager(false)
          setEditingCategory(null)
          setCategoryFormData({
            name: '',
            description: '',
            image: '',
            icon: '',
            displayOrder: 0
          })
          setImageUploadType('url')
          setUploadedImagePreview(null)
        }
      }
    } catch (err) {
      console.error('Category error details:', {
        message: err.message,
        response: err.response,
        request: err.request,
        config: err.config
      })
      
      let errorMessage = 'Failed to update category'
      
      if (err.response) {
        // Server responded with error
        errorMessage = err.response.data?.error || 
                      err.response.data?.message || 
                      `Server error: ${err.response.status} ${err.response.statusText}`
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'Network error: Unable to connect to server. Please check if the backend is running on port 4000.'
      } else {
        // Error in request setup
        errorMessage = err.message || 'An unexpected error occurred'
      }
      
      alert(errorMessage)
      setError(errorMessage)
    }
  }

  const handleCancelCategoryForm = () => {
    setShowCategoryManager(false)
    setEditingCategory(null)
    setCategoryFormData({
      name: '',
      description: '',
      image: '',
      icon: '',
      displayOrder: 0
    })
    setImageUploadType('url')
    setUploadedImagePreview(null)
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
                onClick={() => {
                  setEditingCategory(null)
                  setCategoryFormData({
                    name: '',
                    description: '',
                    image: '',
                    icon: '',
                    displayOrder: 0
                  })
                  setImageUploadType('url')
                  setUploadedImagePreview(null)
                  setShowCategoryManager(true)
                }}
                className="btn-create-category"
                title="Manage categories"
              >
                Manage
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

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <div className="modal-overlay" onClick={handleCancelCategoryForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCategory ? 'Edit Category' : 'Create New Category'}</h3>
              <button className="modal-close" onClick={handleCancelCategoryForm}>×</button>
            </div>
            
            {error && <div className="error-message" style={{margin: '0 20px 20px 20px'}}>{error}</div>}
            
            <form onSubmit={handleCategorySubmit} className="category-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="categoryName">Category Name *</label>
                  <input
                    type="text"
                    id="categoryName"
                    name="name"
                    value={categoryFormData.name}
                    onChange={handleCategoryFormChange}
                    required
                    placeholder="Electronics"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="categoryDisplayOrder">Display Order</label>
                  <input
                    type="number"
                    id="categoryDisplayOrder"
                    name="displayOrder"
                    value={categoryFormData.displayOrder}
                    onChange={handleCategoryFormChange}
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="categoryDescription">Description</label>
                  <textarea
                    id="categoryDescription"
                    name="description"
                    value={categoryFormData.description}
                    onChange={handleCategoryFormChange}
                    placeholder="Category description"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="categoryImage">Category Image</label>
                  <div className="image-upload-tabs">
                    <button
                      type="button"
                      className={`upload-tab ${imageUploadType === 'url' ? 'active' : ''}`}
                      onClick={() => setImageUploadType('url')}
                    >
                      URL
                    </button>
                    <button
                      type="button"
                      className={`upload-tab ${imageUploadType === 'file' ? 'active' : ''}`}
                      onClick={() => setImageUploadType('file')}
                    >
                      Upload File
                    </button>
                  </div>
                  
                  {imageUploadType === 'url' ? (
                    <div className="image-url-input">
                      <input
                        type="url"
                        id="categoryImage"
                        name="image"
                        value={categoryFormData.image}
                        onChange={handleImageUrlChange}
                        placeholder="https://example.com/category.jpg"
                      />
                      {categoryFormData.image && (
                        <button
                          type="button"
                          onClick={clearImage}
                          className="btn-clear-image"
                          title="Clear image"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="image-file-input">
                      <input
                        type="file"
                        id="categoryImageFile"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="file-input"
                      />
                      <label htmlFor="categoryImageFile" className="file-input-label">
                        <span className="file-input-text">
                          {uploadedImagePreview ? 'Change Image' : 'Choose Image File'}
                        </span>
                        <span className="file-input-button">Browse</span>
                      </label>
                      {uploadedImagePreview && (
                        <button
                          type="button"
                          onClick={clearImage}
                          className="btn-clear-image"
                          title="Clear image"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  )}

                  {uploadedImagePreview && (
                    <div className="image-preview-container">
                      <img
                        src={uploadedImagePreview}
                        alt="Category preview"
                        className="image-preview"
                      />
                      <span className="image-preview-label">Preview</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="categoryIcon">Icon (Emoji or Text)</label>
                  <input
                    type="text"
                    id="categoryIcon"
                    name="icon"
                    value={categoryFormData.icon}
                    onChange={handleCategoryFormChange}
                    placeholder="📱"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCancelCategoryForm} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>

            {/* Categories List with Edit/Delete */}
            <div className="categories-list-section">
              <h4>Existing Categories</h4>
              <div className="categories-list">
                {categories.length === 0 ? (
                  <p className="no-categories">No categories found</p>
                ) : (
                  categories.map(cat => (
                    <div key={cat._id} className="category-item">
                      <div className="category-info">
                        <span className="category-name">{cat.name}</span>
                        {cat.icon && <span className="category-icon">{cat.icon}</span>}
                      </div>
                      <div className="category-actions">
                        <button
                          type="button"
                          onClick={() => handleEditCategory(cat)}
                          className="btn-edit-category"
                          title="Edit category"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat._id)}
                          className="btn-delete-category"
                          title="Delete category"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateProductPage

