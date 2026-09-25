import { useEffect, useState, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { removeAuthToken, getUser } from '../utils/auth'
import { adminAPI } from '../services/api'
import './Layout.css'

const Layout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const user = getUser()
  const [pendingVendorRequests, setPendingVendorRequests] = useState(0)

  const fetchPendingVendorRequests = useCallback(async () => {
    try {
      const response = await adminAPI.getAllVendors({
        vendorStatus: 'pending',
        page: 1,
        limit: 1,
      })
      const total =
        response.data?.pagination?.totalVendors ??
        response.data?.vendors?.length ??
        0
      setPendingVendorRequests(Number(total) || 0)
    } catch {
      // Keep last known count if request fails
    }
  }, [])

  useEffect(() => {
    fetchPendingVendorRequests()
    const interval = setInterval(fetchPendingVendorRequests, 30000)
    return () => clearInterval(interval)
  }, [fetchPendingVendorRequests])

  // Refresh when navigating (e.g. after approve/reject on Vendors page)
  useEffect(() => {
    fetchPendingVendorRequests()
  }, [location.pathname, fetchPendingVendorRequests])

  const handleLogout = () => {
    removeAuthToken()
    navigate('/login')
  }

  const isActive = (path) => {
    if (path === '/products') {
      return location.pathname.startsWith('/products')
    }
    if (path === '/vendors') {
      return location.pathname.startsWith('/vendors')
    }
    if (path === '/credits') {
      return location.pathname.startsWith('/credits')
    }
    if (path === '/banners') {
      return location.pathname.startsWith('/banners')
    }
    if (path === '/deals') {
      return location.pathname.startsWith('/deals')
    }
    if (path === '/gift-cards') {
      return location.pathname.startsWith('/gift-cards')
    }
    if (path === '/coupons') {
      return location.pathname.startsWith('/coupons')
    }
    if (path === '/reviews') {
      return location.pathname.startsWith('/reviews')
    }
    if (path === '/orders') {
      return location.pathname.startsWith('/orders')
    }
    return location.pathname === path
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Sahal Admin</h2>
        </div>
        <nav className="sidebar-nav">
          <Link
            to="/dashboard"
            className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
          >
            <span>📊</span> Dashboard
          </Link>
          <Link
            to="/products"
            className={`nav-item ${isActive('/products') ? 'active' : ''}`}
          >
            <span>🛍️</span> Products
          </Link>
          <Link
            to="/users"
            className={`nav-item ${isActive('/users') ? 'active' : ''}`}
          >
            <span>👥</span> Users
          </Link>
          <Link
            to={pendingVendorRequests > 0 ? '/vendors?status=pending' : '/vendors'}
            className={`nav-item ${isActive('/vendors') ? 'active' : ''}`}
          >
            <span>🏪</span>
            <span className="nav-item-label">Vendors</span>
            {pendingVendorRequests > 0 && (
              <span
                className="nav-notify"
                title={`${pendingVendorRequests} pending vendor request${pendingVendorRequests === 1 ? '' : 's'}`}
                aria-label={`${pendingVendorRequests} pending vendor requests`}
              >
                <span className="nav-notify-icon" aria-hidden="true">
                  🔔
                </span>
                <span className="nav-notify-count">
                  {pendingVendorRequests > 99 ? '99+' : pendingVendorRequests}
                </span>
              </span>
            )}
          </Link>
          <div className="nav-section-divider"></div>
          <Link
            to="/credits/balances"
            className={`nav-item ${isActive('/credits') ? 'active' : ''}`}
          >
            <span>💰</span> Credit Balances
          </Link>
          <Link
            to="/credits/transactions"
            className={`nav-item ${isActive('/credits/transactions') ? 'active' : ''}`}
          >
            <span>📝</span> Transactions
          </Link>
          <Link
            to="/credits/adjust"
            className={`nav-item ${isActive('/credits/adjust') ? 'active' : ''}`}
          >
            <span>⚙️</span> Adjust Credits
          </Link>
          <div className="nav-section-divider"></div>
          <Link
            to="/banners"
            className={`nav-item ${isActive('/banners') ? 'active' : ''}`}
          >
            <span>🖼️</span> Banners
          </Link>
          <Link
            to="/deals"
            className={`nav-item ${isActive('/deals') ? 'active' : ''}`}
          >
            <span>🎯</span> Deals
          </Link>
          <Link
            to="/gift-cards"
            className={`nav-item ${isActive('/gift-cards') ? 'active' : ''}`}
          >
            <span>🎁</span> Gift Cards
          </Link>
          <Link
            to="/coupons"
            className={`nav-item ${isActive('/coupons') ? 'active' : ''}`}
          >
            <span>🎫</span> Coupons
          </Link>
          <Link
            to="/reviews"
            className={`nav-item ${isActive('/reviews') ? 'active' : ''}`}
          >
            <span>⭐</span> Reviews
          </Link>
          <div className="nav-section-divider"></div>
          <Link
            to="/orders"
            className={`nav-item ${isActive('/orders') ? 'active' : ''}`}
          >
            <span>📦</span> Orders
          </Link>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-email">{user?.email}</div>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="top-header">
          <h1>
            {location.pathname === '/dashboard' && 'Dashboard'}
            {location.pathname.startsWith('/products') && 'Product Management'}
            {location.pathname === '/users' && 'User Management'}
            {location.pathname.startsWith('/vendors') && 'Vendor Management'}
            {location.pathname.startsWith('/credits/balances') && 'Credit Balances'}
            {location.pathname.startsWith('/credits/transactions') && 'Credit Transactions'}
            {location.pathname.startsWith('/credits/adjust') && 'Adjust Credits'}
            {location.pathname.startsWith('/banners') && 'Banner Management'}
            {location.pathname.startsWith('/deals') && 'Deal Management'}
            {location.pathname.startsWith('/gift-cards') && 'Gift Card Management'}
            {location.pathname.startsWith('/coupons') && 'Coupon Management'}
            {location.pathname.startsWith('/reviews') && 'Review Moderation'}
            {location.pathname.startsWith('/orders') && 'Order Management'}
          </h1>
        </header>
        <div className="content-area">{children}</div>
      </main>
    </div>
  )
}

export default Layout
