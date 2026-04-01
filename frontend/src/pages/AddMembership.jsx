import React, { useState } from 'react'
import { membersAPI } from '../services/api'

function AddMembership() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    membership_type: '6 months'
  })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

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
      await membersAPI.addMember({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        membership_type: formData.membership_type
      })

      setSuccess('✅ Member added successfully!')
      setFormData({
        name: '',
        email: '',
        phone: '',
        membership_type: '6 months'
      })
      setErrors({})

      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || 'Failed to add member' })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>➕ Add Membership</h1>

      {success && <div className="success-message">{success}</div>}
      {errors.submit && <div className="error-message">{errors.submit}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter member name"
            />
            {errors.name && <div className="error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Enter phone number"
            />
          </div>

          <div className="form-group">
            <label>Membership Type *</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="membership_type"
                  value="6 months"
                  checked={formData.membership_type === '6 months'}
                  onChange={(e) => setFormData(prev => ({ ...prev, membership_type: e.target.value }))}
                />
                6 months
              </label>
              <label>
                <input
                  type="radio"
                  name="membership_type"
                  value="1 year"
                  checked={formData.membership_type === '1 year'}
                  onChange={(e) => setFormData(prev => ({ ...prev, membership_type: e.target.value }))}
                />
                1 year
              </label>
              <label>
                <input
                  type="radio"
                  name="membership_type"
                  value="2 years"
                  checked={formData.membership_type === '2 years'}
                  onChange={(e) => setFormData(prev => ({ ...prev, membership_type: e.target.value }))}
                />
                2 years
              </label>
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : '✅ Add Member'}
        </button>
      </form>
    </div>
  )
}

export default AddMembership
