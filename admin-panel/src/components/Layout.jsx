import { Link, useLocation, useNavigate } from 'react-router-dom'
import { removeAuthToken, getUser } from '../utils/auth'
import './Layout.css'

const Layout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const user = getUser()

  const handleLogout = () => {
    removeAuthToken()
    navigate('/login')
  }

  const isActive = (path) => {
    if (path === '/products') {
      return location.pathname.startsWith('/products')
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
            to="/vendors" 
            className={`nav-item ${isActive('/vendors') ? 'active' : ''}`}
          >
            <span>🏪</span> Vendors
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
            {location.pathname === '/vendors' && 'Vendor Management'}
          </h1>
        </header>
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout

