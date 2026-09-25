import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { adminAPI } from '../services/api'
import './VendorsPage.css'

const VendorsPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get('status') === 'pending' ? 'pending' : '',
  )
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalVendors: 0 })
  const [rejectReason, setRejectReason] = useState('')
  const [rejectingId, setRejectingId] = useState(null)

  useEffect(() => {
    fetchVendors()
  }, [search, statusFilter])

  const fetchVendors = async (page = 1) => {
    try {
      setLoading(true)
      const params = {
        page,
        limit: 20,
        ...(search && { search }),
        ...(statusFilter && { vendorStatus: statusFilter })
      }
      const response = await adminAPI.getAllVendors(params)
      setVendors(response.data.vendors)
      setPagination(response.data.pagination)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load vendors')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (vendorId) => {
    if (!window.confirm('Approve this vendor?')) return
    
    try {
      await adminAPI.approveVendor(vendorId)
      fetchVendors(pagination.currentPage)
      alert('Vendor approved successfully!')
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve vendor')
    }
  }

  const handleReject = async (vendorId) => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }
    
    try {
      await adminAPI.rejectVendor(vendorId, rejectReason)
      fetchVendors(pagination.currentPage)
      setRejectingId(null)
      setRejectReason('')
      alert('Vendor rejected successfully!')
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject vendor')
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'approved'
      case 'pending':
        return 'pending'
      case 'rejected':
        return 'rejected'
      default:
        return ''
    }
  }

  return (
    <div className="vendors-page">
      <div className="page-header">
        <h1>Vendors</h1>
        <button onClick={() => navigate('/vendors/create')} className="btn-create">
          + Create Vendor
        </button>
      </div>
      <div className="filters">
        <input
          type="text"
          placeholder="Search by name, email, or business name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading vendors...</div>
      ) : (
        <>
          <div className="vendors-table-container">
            <table className="vendors-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Business Name</th>
                  <th>Business Address</th>
                  <th>Status</th>
                  <th>Credits</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-data">No vendors found</td>
                  </tr>
                ) : (
                  vendors.map((vendor) => (
                    <tr key={vendor._id}>
                      <td>{vendor.name}</td>
                      <td>{vendor.email}</td>
                      <td>{vendor.businessName || 'N/A'}</td>
                      <td>{vendor.businessAddress || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(vendor.vendorStatus)}`}>
                          {vendor.vendorStatus}
                        </span>
                      </td>
                      <td>{vendor.credits || 0}</td>
                      <td>{new Date(vendor.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          {vendor.vendorStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(vendor._id)}
                                className="btn-approve"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setRejectingId(vendor._id)}
                                className="btn-reject"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {rejectingId === vendor._id && (
                            <div className="reject-form">
                              <input
                                type="text"
                                placeholder="Rejection reason..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="reject-input"
                                autoFocus
                              />
                              <button
                                onClick={() => handleReject(vendor._id)}
                                className="btn-confirm-reject"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => {
                                  setRejectingId(null)
                                  setRejectReason('')
                                }}
                                className="btn-cancel"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => fetchVendors(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="page-btn"
              >
                Previous
              </button>
              <span>
                Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalVendors} total)
              </span>
              <button
                onClick={() => fetchVendors(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="page-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default VendorsPage

