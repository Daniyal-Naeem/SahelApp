import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { productAPI } from '../services/api'
import './ProductsPage.css'

const ProductsPage = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await productAPI.getAllProducts()
      setProducts(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    
    try {
      await productAPI.deleteProduct(productId)
      fetchProducts()
      alert('Product deleted successfully!')
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete product')
    }
  }

  const filteredProducts = products.filter(product =>
    product.title?.toLowerCase().includes(search.toLowerCase()) ||
    product.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Products</h1>
        <button onClick={() => navigate('/products/create')} className="btn-create">
          + Create Product
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : (
        <div className="products-grid">
          {filteredProducts.length === 0 ? (
            <div className="no-data">No products found</div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product._id} className="product-card">
                <div className="product-image">
                  {product.image && product.image.length > 0 ? (
                    <img src={product.image[0]} alt={product.title} />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                </div>
                <div className="product-info">
                  <h3>{product.title}</h3>
                  <p className="product-description">{product.description?.substring(0, 100)}...</p>
                  <div className="product-price">
                    <span className="current-price">${product.price}</span>
                    {product.priceBeforeDeal && (
                      <span className="old-price">${product.priceBeforeDeal}</span>
                    )}
                  </div>
                  <div className="product-meta">
                    <span className="status-badge">{product.status?.name}</span>
                    {product.category && <span className="category-tag">Category</span>}
                  </div>
                  <div className="product-actions">
                    <button
                      onClick={() => navigate(`/products/${product._id}`)}
                      className="btn-view"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default ProductsPage

