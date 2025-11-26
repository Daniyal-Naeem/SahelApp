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
    </div>
  )
}

export default DashboardPage


