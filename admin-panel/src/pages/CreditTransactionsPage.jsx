import { useState, useEffect } from 'react'
import { creditAdminAPI } from '../services/api'
import './CreditTransactionsPage.css'

const CreditTransactionsPage = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    userId: '',
    minAmount: '',
    maxAmount: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50
  })
  const [pagination, setPagination] = useState({})

  useEffect(() => {
    fetchTransactions()
  }, [filters.page])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.type) params.type = filters.type
      if (filters.status) params.status = filters.status
      if (filters.userId) params.userId = filters.userId
      if (filters.minAmount) params.minAmount = filters.minAmount
      if (filters.maxAmount) params.maxAmount = filters.maxAmount
      if (filters.startDate) params.startDate = filters.startDate
      if (filters.endDate) params.endDate = filters.endDate
      params.page = filters.page
      params.limit = filters.limit

      const response = await creditAdminAPI.getCreditTransactions(params)
      setTransactions(response.data.transactions)
      setPagination(response.data.pagination)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 })
  }

  const handleSearch = () => {
    fetchTransactions()
  }

  const handleReset = () => {
    setFilters({
      type: '',
      status: '',
      userId: '',
      minAmount: '',
      maxAmount: '',
      startDate: '',
      endDate: '',
      page: 1,
      limit: 50
    })
  }

  const getTypeBadgeClass = (type) => {
    const typeMap = {
      topup: 'type-topup',
      transfer: 'type-transfer',
      consume: 'type-consume',
      refund: 'type-refund',
      adjust: 'type-adjust'
    }
    return typeMap[type] || 'type-other'
  }

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      completed: 'status-completed',
      pending: 'status-pending',
      failed: 'status-failed',
      cancelled: 'status-cancelled'
    }
    return statusMap[status] || 'status-other'
  }

  if (loading && transactions.length === 0) {
    return <div className="loading">Loading transactions...</div>
  }

  return (
    <div className="credit-transactions-page">
      <div className="page-header">
        <h1>Credit Transactions</h1>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="topup">Top-up</option>
            <option value="transfer">Transfer</option>
            <option value="consume">Consume</option>
            <option value="refund">Refund</option>
            <option value="adjust">Adjust</option>
          </select>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="text"
            name="userId"
            placeholder="User ID"
            value={filters.userId}
            onChange={handleFilterChange}
            className="filter-input"
          />
          <input
            type="number"
            name="minAmount"
            placeholder="Min amount"
            value={filters.minAmount}
            onChange={handleFilterChange}
            className="filter-input"
          />
          <input
            type="number"
            name="maxAmount"
            placeholder="Max amount"
            value={filters.maxAmount}
            onChange={handleFilterChange}
            className="filter-input"
          />
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="filter-input"
          />
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="filter-input"
          />
          <button onClick={handleSearch} className="btn-primary">Search</button>
          <button onClick={handleReset} className="btn-secondary">Reset</button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="transactions-table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>TX ID</th>
              <th>Type</th>
              <th>User</th>
              <th>Sender</th>
              <th>Receiver</th>
              <th>Amount</th>
              <th>Balance After</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">No transactions found</td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.txId}>
                  <td className="tx-id">{tx.txId}</td>
                  <td>
                    <span className={`type-badge ${getTypeBadgeClass(tx.type)}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td>{tx.user?.name || 'N/A'}</td>
                  <td>{tx.sender?.name || (tx.hideSender ? 'Anonymous' : 'N/A')}</td>
                  <td>{tx.receiver?.name || 'N/A'}</td>
                  <td className="amount">{tx.amount.toFixed(2)}</td>
                  <td>{tx.balanceAfter?.toFixed(2) || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(tx.status)}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td>{new Date(tx.createdAt).toLocaleString()}</td>
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

export default CreditTransactionsPage







