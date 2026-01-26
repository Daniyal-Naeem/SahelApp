import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { orderAPI } from '../services/api'
import './OrderDetailPage.css'

const OrderDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await orderAPI.getOrderById(id)
      setOrder(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading order details...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  if (!order) {
    return <div className="error-message">Order not found</div>
  }

  return (
    <div className="order-detail-page">
      <div className="page-header">
        <button onClick={() => navigate('/orders')} className="btn-back">
          ← Back to Orders
        </button>
        <h1>Order Details: {order.orderNumber}</h1>
      </div>

      <div className="order-detail-grid">
        <div className="order-info-card">
          <h2>Order Information</h2>
          <div className="info-row">
            <span className="info-label">Order Number:</span>
            <span className="info-value">{order.orderNumber}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Status:</span>
            <span className={`status-badge status-${order.status}`}>
              {order.status}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Payment Status:</span>
            <span className={`payment-badge payment-${order.paymentStatus}`}>
              {order.paymentStatus}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Payment Method:</span>
            <span className="info-value">{order.paymentMethod || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Order Date:</span>
            <span className="info-value">{new Date(order.createdAt).toLocaleString()}</span>
          </div>
          {order.shippedAt && (
            <div className="info-row">
              <span className="info-label">Shipped Date:</span>
              <span className="info-value">{new Date(order.shippedAt).toLocaleString()}</span>
            </div>
          )}
          {order.deliveredAt && (
            <div className="info-row">
              <span className="info-label">Delivered Date:</span>
              <span className="info-value">{new Date(order.deliveredAt).toLocaleString()}</span>
            </div>
          )}
          {order.trackingNumber && (
            <div className="info-row">
              <span className="info-label">Tracking Number:</span>
              <span className="info-value">{order.trackingNumber}</span>
            </div>
          )}
        </div>

        <div className="customer-info-card">
          <h2>Customer Information</h2>
          <div className="info-row">
            <span className="info-label">Name:</span>
            <span className="info-value">{order.user?.name || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Email:</span>
            <span className="info-value">{order.user?.email || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Phone:</span>
            <span className="info-value">{order.user?.phone || 'N/A'}</span>
          </div>
        </div>

        <div className="shipping-info-card">
          <h2>Shipping Address</h2>
          {order.shippingAddress ? (
            <>
              <div className="info-row">
                <span className="info-label">Street:</span>
                <span className="info-value">{order.shippingAddress.street || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">City:</span>
                <span className="info-value">{order.shippingAddress.city || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">State:</span>
                <span className="info-value">{order.shippingAddress.state || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Zip Code:</span>
                <span className="info-value">{order.shippingAddress.zipCode || 'N/A'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Country:</span>
                <span className="info-value">{order.shippingAddress.country || 'N/A'}</span>
              </div>
              {order.shippingAddress.phone && (
                <div className="info-row">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">{order.shippingAddress.phone}</span>
                </div>
              )}
            </>
          ) : (
            <p className="no-data">No shipping address provided</p>
          )}
        </div>

        <div className="items-card">
          <h2>Order Items</h2>
          <div className="items-list">
            {order.items && order.items.length > 0 ? (
              order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-image">
                    {item.product?.image && item.product.image.length > 0 ? (
                      <img src={item.product.image[0]} alt={item.product.title} />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </div>
                  <div className="item-details">
                    <h4>{item.product?.title || 'Product'}</h4>
                    <div className="item-meta">
                      <span>Quantity: {item.quantity}</span>
                      <span>Price: ${item.price?.toFixed(2)}</span>
                      <span className="item-total">Total: ${item.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">No items found</p>
            )}
          </div>
        </div>

        <div className="summary-card">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>${order.subtotal?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="summary-row">
            <span>Shipping Cost:</span>
            <span>${order.shippingCost?.toFixed(2) || '0.00'}</span>
          </div>
          {order.discount > 0 && (
            <div className="summary-row discount">
              <span>Discount:</span>
              <span>-${order.discount?.toFixed(2)}</span>
            </div>
          )}
          {order.creditUsed > 0 && (
            <div className="summary-row credit">
              <span>Credits Used:</span>
              <span>-${order.creditUsed?.toFixed(2)}</span>
            </div>
          )}
          <div className="summary-row total">
            <span>Total:</span>
            <span>${order.total?.toFixed(2) || '0.00'}</span>
          </div>
        </div>

        {order.notes && (
          <div className="notes-card">
            <h2>Notes</h2>
            <p>{order.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderDetailPage















