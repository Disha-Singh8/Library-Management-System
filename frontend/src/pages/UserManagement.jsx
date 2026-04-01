import React, { useState, useEffect } from 'react'
import { authAPI } from '../services/api'

function UserManagement() {
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'user',
    email: '',
    phone: ''
  })
  const [userType, setUserType] = useState('new')
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await authAPI.getUsers()
      setUsers(response.data)
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setFetching(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.username.trim()) newErrors.username = 'Username is required'
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (userType === 'new' && !formData.password) newErrors.password = 'Password is required for new users'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await authAPI.addUser({
        username: formData.username,
        password: formData.password,
        name: formData.name,
        role: formData.role,
        email: formData.email,
        phone: formData.phone
      })

      setSuccess('✅ User added/updated successfully!')
      setFormData({
        username: '',
        password: '',
        name: '',
        role: 'user',
        email: '',
        phone: ''
      })
      setUserType('new')
      setShowForm(false)
      setErrors({})

      // Refresh users list
      await fetchUsers()

      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || 'Failed to add/update user' })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return <div className="loading">Loading users...</div>
  }

  return (
    <div>
      <h1>👥 User Management</h1>

      {success && <div className="success-message">{success}</div>}
      {errors.submit && <div className="error-message">{errors.submit}</div>}

      <button onClick={() => setShowForm(!showForm)} style={{ marginBottom: '20px' }}>
        {showForm ? '❌ Cancel' : '➕ Add New User'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#ecf0f1', borderRadius: '4px' }}>
          <div className="form-group">
            <label>User Type *</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="userType"
                  value="new"
                  checked={userType === 'new'}
                  onChange={(e) => setUserType(e.target.value)}
                />
                New User
              </label>
              <label>
                <input
                  type="radio"
                  name="userType"
                  value="existing"
                  checked={userType === 'existing'}
                  onChange={(e) => setUserType(e.target.value)}
                />
                Existing User
              </label>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Username *</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Enter username"
              />
              {errors.username && <div className="error">{errors.username}</div>}
            </div>

            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
              />
              {errors.name && <div className="error">{errors.name}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password {userType === 'new' ? '*' : '(leave empty to keep current)'}</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder={userType === 'new' ? 'Enter password' : 'Enter new password or leave empty'}
              />
              {errors.password && <div className="error">{errors.password}</div>}
            </div>

            <div className="form-group">
              <label>Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email"
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : '✅ Save User'}
          </button>
        </form>
      )}

      <div>
        <h3>All Users</h3>
        {users.length === 0 ? (
          <p>No users found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.name}</td>
                  <td><strong>{user.role.toUpperCase()}</strong></td>
                  <td>{user.email || '-'}</td>
                  <td>{user.phone || '-'}</td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default UserManagement
