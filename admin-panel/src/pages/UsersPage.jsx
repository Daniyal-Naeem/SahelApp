import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminAPI } from '../services/api'
import './UsersPage.css'

const UsersPage = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalUsers: 0 })

  useEffect(() => {
    fetchUsers()
  }, [search, roleFilter, statusFilter])

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true)
      const params = {
        page,
        limit: 20,
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { isActive: statusFilter })
      }
      const response = await adminAPI.getAllUsers(params)
      setUsers(response.data.users)
      setPagination(response.data.pagination)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      await adminAPI.updateUserStatus(userId, !currentStatus)
      fetchUsers(pagination.currentPage)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user status')
    }
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    
    try {
      await adminAPI.deleteUser(userId)
      fetchUsers(pagination.currentPage)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user')
    }
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>Users</h1>
        <button onClick={() => navigate('/users/create')} className="btn-create">
          + Create User
        </button>
      </div>
      <div className="filters">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="vendor">Vendor</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <>
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Credits</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">No users found</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge role-${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{user.credits || 0}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleStatusToggle(user._id, user.isActive)}
                            className={`btn-toggle ${user.isActive ? 'deactivate' : 'activate'}`}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="btn-delete"
                          >
                            Delete
                          </button>
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
                onClick={() => fetchUsers(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="page-btn"
              >
                Previous
              </button>
              <span>
                Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalUsers} total)
              </span>
              <button
                onClick={() => fetchUsers(pagination.currentPage + 1)}
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

export default UsersPage

