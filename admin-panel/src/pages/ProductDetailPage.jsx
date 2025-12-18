import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productAPI } from '../services/api'
import './ProductDetailPage.css'

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await productAPI.getProductById(id)
      setProduct(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading product details...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  if (!product) {
    return <div className="error-message">Product not found</div>
  }

  return (
    <div className="product-detail-page">
      <div className="page-header">
        <button onClick={() => navigate('/products')} className="btn-back">
          ← Back to Products
        </button>
        <div className="header-content">
          <h1>Product Details: {product.title}</h1>
          <button onClick={() => navigate(`/products/${id}/edit`)} className="btn-edit">
            ✏️ Edit Product
          </button>
        </div>
      </div>

      <div className="product-detail-grid">
        <div className="product-info-card">
          <h2>Product Information</h2>
          <div className="info-row">
            <span className="info-label">Title:</span>
            <span className="info-value">{product.title}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Status:</span>
            <span className={`status-badge status-${product.status?.name?.toLowerCase() || 'active'}`}>
              {product.status?.icon} {product.status?.name || 'Active'}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Price:</span>
            <span className="info-value">${product.price?.toFixed(2)}</span>
          </div>
          {product.priceBeforeDeal && (
            <div className="info-row">
              <span className="info-label">Original Price:</span>
              <span className="info-value">${product.priceBeforeDeal?.toFixed(2)}</span>
            </div>
          )}
          <div className="info-row">
            <span className="info-label">Discount %:</span>
            <span className="info-value">{product.priceOff || 0}%</span>
          </div>
          <div className="info-row">
            <span className="info-label">Rating:</span>
            <span className="info-value">⭐ {product.stars?.toFixed(1) || 0} ({product.numberOfReview || 0} reviews)</span>
          </div>
          {product.category && (
            <div className="info-row">
              <span className="info-label">Category:</span>
              <span className="info-value">{product.category.name || 'N/A'}</span>
            </div>
          )}
          <div className="info-row">
            <span className="info-label">Created:</span>
            <span className="info-value">{new Date(product.createdAt).toLocaleString()}</span>
          </div>
        </div>

        <div className="product-description-card">
          <h2>Description</h2>
          <div className="description-content">
            {product.description || 'No description available'}
          </div>
        </div>

        <div className="product-images-card">
          <h2>Product Images</h2>
          <div className="images-grid">
            {product.image && product.image.length > 0 ? (
              product.image.map((img, index) => (
                <div key={index} className="image-item">
                  <img src={img} alt={`${product.title} ${index + 1}`} />
                </div>
              ))
            ) : (
              <div className="no-image">No images available</div>
            )}
          </div>
        </div>

        {product.ukSide && product.ukSide.length > 0 && (
          <div className="product-sizes-card">
            <h2>UK Sizes</h2>
            <div className="sizes-list">
              {product.ukSide.map((size, index) => (
                <span key={index} className="size-tag">{size}</span>
              ))}
            </div>
          </div>
        )}

        {product.tags && product.tags.length > 0 && (
          <div className="product-tags-card">
            <h2>Tags</h2>
            <div className="tags-list">
              {product.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetailPage
