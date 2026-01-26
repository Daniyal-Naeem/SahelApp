import { useState, useEffect } from 'react'
import { reviewAPI } from '../services/api'
import './ReviewsPage.css'

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('pending') // pending, flagged, all
  const [selectedReviews, setSelectedReviews] = useState([])

  useEffect(() => {
    fetchReviews()
  }, [activeTab])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      let response
      if (activeTab === 'pending') {
        response = await reviewAPI.getPendingReviews()
      } else if (activeTab === 'flagged') {
        response = await reviewAPI.getFlaggedReviews()
      } else {
        response = await reviewAPI.getAllReviews({ status: 'approved' })
      }
      setReviews(response.data.reviews || response.data)
      setSelectedReviews([])
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (reviewId, notes = '') => {
    try {
      await reviewAPI.approveReview(reviewId, notes)
      fetchReviews()
      alert('Review approved successfully!')
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve review')
    }
  }

  const handleReject = async (reviewId, notes = '') => {
    const notesInput = window.prompt('Enter rejection reason (optional):')
    try {
      await reviewAPI.rejectReview(reviewId, notesInput || notes)
      fetchReviews()
      alert('Review rejected successfully!')
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject review')
    }
  }

  const handleBulkApprove = async () => {
    if (selectedReviews.length === 0) {
      alert('Please select reviews to approve')
      return
    }
    if (!window.confirm(`Approve ${selectedReviews.length} reviews?`)) return

    try {
      await reviewAPI.bulkApproveReviews(selectedReviews)
      fetchReviews()
      alert('Reviews approved successfully!')
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve reviews')
    }
  }

  const handleBulkReject = async () => {
    if (selectedReviews.length === 0) {
      alert('Please select reviews to reject')
      return
    }
    const notes = window.prompt('Enter rejection reason (optional):')
    if (!window.confirm(`Reject ${selectedReviews.length} reviews?`)) return

    try {
      await reviewAPI.bulkRejectReviews(selectedReviews, notes)
      fetchReviews()
      alert('Reviews rejected successfully!')
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject reviews')
    }
  }

  const handleToggleSelect = (reviewId) => {
    setSelectedReviews(prev =>
      prev.includes(reviewId)
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    )
  }

  const handleSelectAll = () => {
    if (selectedReviews.length === reviews.length) {
      setSelectedReviews([])
    } else {
      setSelectedReviews(reviews.map(r => r._id))
    }
  }

  return (
    <div className="reviews-page">
      <div className="page-header">
        <h1>Review Moderation</h1>
        {(activeTab === 'pending' || activeTab === 'flagged') && selectedReviews.length > 0 && (
          <div className="bulk-actions">
            <button onClick={handleBulkApprove} className="btn-bulk-approve">
              Approve Selected ({selectedReviews.length})
            </button>
            <button onClick={handleBulkReject} className="btn-bulk-reject">
              Reject Selected ({selectedReviews.length})
            </button>
          </div>
        )}
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending ({reviews.length})
        </button>
        <button
          className={`tab ${activeTab === 'flagged' ? 'active' : ''}`}
          onClick={() => setActiveTab('flagged')}
        >
          Flagged ({reviews.length})
        </button>
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Reviews
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading reviews...</div>
      ) : (
        <div className="reviews-list">
          {reviews.length === 0 ? (
            <div className="no-data">No reviews found</div>
          ) : (
            <>
              {(activeTab === 'pending' || activeTab === 'flagged') && (
                <div className="select-all">
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedReviews.length === reviews.length && reviews.length > 0}
                      onChange={handleSelectAll}
                    />
                    Select All
                  </label>
                </div>
              )}
              {reviews.map((review) => (
                <div key={review._id} className="review-card">
                  {(activeTab === 'pending' || activeTab === 'flagged') && (
                    <input
                      type="checkbox"
                      checked={selectedReviews.includes(review._id)}
                      onChange={() => handleToggleSelect(review._id)}
                      className="review-checkbox"
                    />
                  )}
                  <div className="review-content">
                    <div className="review-header">
                      <div className="review-user">
                        <strong>{review.user?.name || 'Anonymous'}</strong>
                        {review.verifiedPurchase && (
                          <span className="verified-badge">✓ Verified Purchase</span>
                        )}
                      </div>
                      <div className="review-rating">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                        <span className="rating-number">{review.rating}/5</span>
                      </div>
                    </div>
                    {review.title && <h4>{review.title}</h4>}
                    <p className="review-comment">{review.comment}</p>
                    {review.product && (
                      <div className="review-product">
                        Product: {review.product.title}
                      </div>
                    )}
                    {review.flagged && (
                      <div className="flagged-info">
                        <strong>Flagged:</strong> {review.flaggedReason || 'No reason provided'}
                      </div>
                    )}
                    <div className="review-meta">
                      <span>{new Date(review.createdAt).toLocaleString()}</span>
                      {review.reportCount > 0 && (
                        <span className="report-count">Reports: {review.reportCount}</span>
                      )}
                    </div>
                    {(activeTab === 'pending' || activeTab === 'flagged') && (
                      <div className="review-actions">
                        <button
                          onClick={() => handleApprove(review._id)}
                          className="btn-approve"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(review._id)}
                          className="btn-reject"
                        >
                          Reject
                        </button>
                        {review.flagged && (
                          <button
                            onClick={async () => {
                              try {
                                await reviewAPI.unflagReview(review._id)
                                fetchReviews()
                              } catch (err) {
                                alert(err.response?.data?.error || 'Failed to unflag review')
                              }
                            }}
                            className="btn-unflag"
                          >
                            Unflag
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default ReviewsPage















