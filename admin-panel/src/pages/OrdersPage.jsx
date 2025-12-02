import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderAPI } from '../services/api'
import './OrdersPage.css'

const OrdersPage = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [updateForm, setUpdateForm] = useState({
    status: '',
    trackingNumber: '',
    notes: ''
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filterStatus) params.status = filterStatus
      if (filterPaymentStatus) params.paymentStatus = filterPaymentStatus
      
      const response = await orderAPI.getAllOrders(params)
      setOrders(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (order) => {
    setSelectedOrder(order)
    setUpdateForm({
      status: order.status,
      trackingNumber: order.trackingNumber || '',
      notes: order.notes || ''
    })
    setShowUpdateModal(true)
  }

  const handleSubmitUpdate = async (e) => {
    e.preventDefault()
    if (!selectedOrder) return

    try {
      await orderAPI.updateOrderStatus(selectedOrder._id, updateForm)
      alert('Order updated successfully!')
      setShowUpdateModal(false)
      setSelectedOrder(null)
      fetchOrders()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update order')
    }
  }

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return

    try {
      await orderAPI.cancelOrder(orderId)
      alert('Order cancelled successfully!')
      fetchOrders()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel order')
    }
  }

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      processing: 'status-processing',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    }
    return statusMap[status] || 'status-default'
  }

  const getPaymentStatusBadgeClass = (status) => {
    const statusMap = {
      pending: 'payment-pending',
      paid: 'payment-paid',
      failed: 'payment-failed',
      refunded: 'payment-refunded'
    }
    return statusMap[status] || 'payment-default'
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !filterStatus || order.status === filterStatus
    const matchesPaymentStatus = !filterPaymentStatus || order.paymentStatus === filterPaymentStatus
    return matchesSearch && matchesStatus && matchesPaymentStatus
  })

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>Order Management</h1>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by order number, customer name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={filterPaymentStatus}
          onChange={(e) => setFilterPaymentStatus(e.target.value)}
          className="filter-select"
        >
          <option value="">All Payment Statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <button onClick={fetchOrders} className="btn-refresh">
          Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading orders...</div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">No orders found</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="order-number">{order.orderNumber}</td>
                    <td>
                      <div className="customer-info">
                        <div className="customer-name">{order.user?.name || 'N/A'}</div>
                        <div className="customer-email">{order.user?.email || 'N/A'}</div>
                      </div>
                    </td>
                    <td>
                      <div className="items-count">
                        {order.items?.length || 0} item(s)
                        {order.creditUsed > 0 && (
                          <div className="credit-used">Credits: ${order.creditUsed?.toFixed(2)}</div>
                        )}
                      </div>
                    </td>
                    <td className="order-total">${order.total?.toFixed(2) || '0.00'}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <span className={`payment-badge ${getPaymentStatusBadgeClass(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleUpdateStatus(order)}
                          className="btn-update"
                        >
                          Update
                        </button>
                        {['pending', 'confirmed'].includes(order.status) && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="btn-cancel"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/orders/${order._id}`)}
                          className="btn-view"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Update Order Modal */}
      {showUpdateModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Order: {selectedOrder.orderNumber}</h2>
              <button
                className="modal-close"
                onClick={() => setShowUpdateModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitUpdate} className="update-form">
              <div className="form-group">
                <label htmlFor="status">Order Status *</label>
                <select
                  id="status"
                  name="status"
                  value={updateForm.status}
                  onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                  required
                  className="form-select"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="trackingNumber">Tracking Number</label>
                <input
                  type="text"
                  id="trackingNumber"
                  name="trackingNumber"
                  value={updateForm.trackingNumber}
                  onChange={(e) => setUpdateForm({ ...updateForm, trackingNumber: e.target.value })}
                  className="form-input"
                  placeholder="Enter tracking number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={updateForm.notes}
                  onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                  className="form-textarea"
                  rows="3"
                  placeholder="Add any notes about this order"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="btn-cancel-form"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Update Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrdersPage







