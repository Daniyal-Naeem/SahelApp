import { useState, useEffect } from 'react'
import { adminAPI } from '../services/api'
import './DashboardPage.css'

const DashboardPage = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getDashboardStats()
      setStats(response.data.stats)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  if (!stats) {
    return <div className="error">No data available</div>
  }

  return (
    <div className="dashboard">
      <h2 className="dashboard-section-title">Overview</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-value">{stats.users?.total || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏪</div>
          <div className="stat-content">
            <h3>Total Vendors</h3>
            <p className="stat-value">{stats.vendors?.total || 0}</p>
            <p className="stat-subtitle">{stats.vendors?.pending || 0} pending approval</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Total Orders</h3>
            <p className="stat-value">{stats.orders?.total || 0}</p>
            <p className="stat-subtitle">{stats.orders?.pending || 0} pending</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🛍️</div>
          <div className="stat-content">
            <h3>Total Products</h3>
            <p className="stat-value">{stats.products?.total || 0}</p>
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">${stats.revenue?.total?.toLocaleString() || 0}</p>
          </div>
        </div>
      </div>

      <h2 className="dashboard-section-title">Content Management</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🖼️</div>
          <div className="stat-content">
            <h3>Banners</h3>
            <p className="stat-value">{stats.banners?.total || 0}</p>
            <p className="stat-subtitle">{stats.banners?.active || 0} active</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>Deals</h3>
            <p className="stat-value">{stats.deals?.total || 0}</p>
            <p className="stat-subtitle">{stats.deals?.active || 0} active</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📌</div>
          <div className="stat-content">
            <h3>Pinned Products</h3>
            <p className="stat-value">{stats.pinnedProducts?.total || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📢</div>
          <div className="stat-content">
            <h3>App Ads</h3>
            <p className="stat-value">{stats.appAds?.total || 0}</p>
            <p className="stat-subtitle">{stats.appAds?.active || 0} active</p>
          </div>
        </div>
      </div>

      <h2 className="dashboard-section-title">Promotions & Reviews</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎁</div>
          <div className="stat-content">
            <h3>Gift Cards</h3>
            <p className="stat-value">{stats.giftCards?.total || 0}</p>
            <p className="stat-subtitle">
              {stats.giftCards?.active || 0} active, {stats.giftCards?.redeemed || 0} redeemed
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎫</div>
          <div className="stat-content">
            <h3>Coupons</h3>
            <p className="stat-value">{stats.coupons?.total || 0}</p>
            <p className="stat-subtitle">{stats.coupons?.active || 0} active</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>Reviews</h3>
            <p className="stat-value">{stats.reviews?.total || 0}</p>
            <p className="stat-subtitle">
              {stats.reviews?.pending || 0} pending, {stats.reviews?.flagged || 0} flagged
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <h3>Approved Reviews</h3>
            <p className="stat-value">{stats.reviews?.approved || 0}</p>
            <p className="stat-subtitle">Total approved</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage


