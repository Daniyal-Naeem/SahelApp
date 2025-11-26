import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { bannerAPI } from '../services/api'
import './BannersPage.css'

const BannersPage = () => {
  const navigate = useNavigate()
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      setLoading(true)
      const response = await bannerAPI.getAllBanners()
      setBanners(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load banners')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (bannerId) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return
    
    try {
      await bannerAPI.deleteBanner(bannerId)
      fetchBanners()
      alert('Banner deleted successfully!')
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete banner')
    }
  }

  const handleToggleActive = async (banner) => {
    try {
      await bannerAPI.updateBanner(banner._id, { isActive: !banner.isActive })
      fetchBanners()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update banner')
    }
  }

  const filteredBanners = banners.filter(banner => {
    const matchesSearch = banner.title?.toLowerCase().includes(search.toLowerCase()) ||
                         banner.description?.toLowerCase().includes(search.toLowerCase())
    const matchesType = !filterType || banner.type === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="banners-page">
      <div className="page-header">
        <h1>Banners</h1>
        <button onClick={() => navigate('/banners/create')} className="btn-create">
          + Create Banner
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search banners..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="filter-select"
        >
          <option value="">All Types</option>
          <option value="slider">Slider</option>
          <option value="promotional">Promotional</option>
          <option value="ad">Ad</option>
          <option value="deal">Deal</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading banners...</div>
      ) : (
        <div className="banners-grid">
          {filteredBanners.length === 0 ? (
            <div className="no-data">No banners found</div>
          ) : (
            filteredBanners.map((banner) => (
              <div key={banner._id} className="banner-card">
                <div className="banner-image">
                  {banner.image ? (
                    <img src={banner.image} alt={banner.title} />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                </div>
                <div className="banner-info">
                  <div className="banner-header">
                    <h3>{banner.title}</h3>
                    <span className={`status-badge ${banner.isActive ? 'active' : 'inactive'}`}>
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="banner-description">{banner.description}</p>
                  <div className="banner-meta">
                    <span className="type-badge">{banner.type}</span>
                    <span className="order-badge">Order: {banner.order}</span>
                    {banner.targetUrl && (
                      <span className="url-badge">Has URL</span>
                    )}
                  </div>
                  <div className="banner-dates">
                    {banner.startDate && (
                      <span>Start: {new Date(banner.startDate).toLocaleDateString()}</span>
                    )}
                    {banner.endDate && (
                      <span>End: {new Date(banner.endDate).toLocaleDateString()}</span>
                    )}
                  </div>
                  <div className="banner-stats">
                    <span>Views: {banner.viewCount || 0}</span>
                    <span>Clicks: {banner.clickCount || 0}</span>
                  </div>
                  <div className="banner-actions">
                    <button
                      onClick={() => handleToggleActive(banner)}
                      className={`btn-toggle ${banner.isActive ? 'btn-deactivate' : 'btn-activate'}`}
                    >
                      {banner.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => navigate(`/banners/${banner._id}/edit`)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(banner._id)}
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

export default BannersPage

