import { useState, useEffect } from 'react'
import { creditAdminAPI } from '../services/api'
import './CreditBalancesPage.css'

const CreditBalancesPage = () => {
  const [balances, setBalances] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    minBalance: '',
    maxBalance: '',
    email: '',
    name: '',
    page: 1,
    limit: 50
  })
  const [pagination, setPagination] = useState({})

  useEffect(() => {
    fetchBalances()
  }, [filters.page])

  const fetchBalances = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.minBalance) params.minBalance = filters.minBalance
      if (filters.maxBalance) params.maxBalance = filters.maxBalance
      if (filters.email) params.email = filters.email
      if (filters.name) params.name = filters.name
      params.page = filters.page
      params.limit = filters.limit

      const response = await creditAdminAPI.getCreditBalances(params)
      setBalances(response.data.balances)
      setPagination(response.data.pagination)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load credit balances')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 })
  }

  const handleSearch = () => {
    fetchBalances()
  }

  const handleReset = () => {
    setFilters({
      minBalance: '',
      maxBalance: '',
      email: '',
      name: '',
      page: 1,
      limit: 50
    })
  }

  if (loading && balances.length === 0) {
    return <div className="loading">Loading credit balances...</div>
  }

  return (
    <div className="credit-balances-page">
      <div className="page-header">
        <h1>Credit Balances</h1>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            name="email"
            placeholder="Search by email"
            value={filters.email}
            onChange={handleFilterChange}
            className="filter-input"
          />
          <input
            type="text"
            name="name"
            placeholder="Search by name"
            value={filters.name}
            onChange={handleFilterChange}
            className="filter-input"
          />
          <input
            type="number"
            name="minBalance"
            placeholder="Min balance"
            value={filters.minBalance}
            onChange={handleFilterChange}
            className="filter-input"
          />
          <input
            type="number"
            name="maxBalance"
            placeholder="Max balance"
            value={filters.maxBalance}
            onChange={handleFilterChange}
            className="filter-input"
          />
          <button onClick={handleSearch} className="btn-primary">Search</button>
          <button onClick={handleReset} className="btn-secondary">Reset</button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="balances-table-container">
        <table className="balances-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Balance</th>
              <th>Currency</th>
              <th>Total Earned</th>
              <th>Total Spent</th>
              <th>Last Transaction</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {balances.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">No balances found</td>
              </tr>
            ) : (
              balances.map((balance) => (
                <tr key={balance.userId}>
                  <td>{balance.user?.name || 'N/A'}</td>
                  <td>{balance.user?.email || 'N/A'}</td>
                  <td><span className={`role-badge role-${balance.user?.role}`}>{balance.user?.role || 'N/A'}</span></td>
                  <td className="balance-amount">{balance.balance.toFixed(2)}</td>
                  <td>{balance.currency}</td>
                  <td>{balance.stats?.totalEarned?.toFixed(2) || '0.00'}</td>
                  <td>{balance.stats?.totalSpent?.toFixed(2) || '0.00'}</td>
                  <td>
                    {balance.lastTransactionAt
                      ? new Date(balance.lastTransactionAt).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td>
                    <button
                      className="btn-link"
                      onClick={() => window.location.href = `/credits/balance/${balance.userId}`}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            disabled={filters.page === 1}
            className="btn-secondary"
          >
            Previous
          </button>
          <span>Page {pagination.page} of {pagination.pages}</span>
          <button
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            disabled={filters.page >= pagination.pages}
            className="btn-secondary"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default CreditBalancesPage







