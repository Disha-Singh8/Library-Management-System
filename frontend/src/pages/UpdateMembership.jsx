import React, { useState, useEffect } from 'react'
import { membersAPI } from '../services/api'

function UpdateMembership() {
  const [members, setMembers] = useState([])
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    membership_type: '6 months',
    membership_start_date: '',
    membership_end_date: '',
    action: 'extend'
  })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const response = await membersAPI.getAllMembers()
      setMembers(response.data)
    } catch (err) {
      console.error('Failed to fetch members:', err)
    }
  }

  const handleMemberSelect = async (memberId) => {
    setSelectedMemberId(memberId)
    setFetching(true)

    try {
      const response = await membersAPI.getMember(memberId)
      const member = response.data

      setFormData({
        name: member.name,
        email: member.email,
        phone: member.phone,
        membership_type: member.membership_type,
        membership_start_date: member.membership_start_date,
        membership_end_date: member.membership_end_date,
        action: 'extend'
      })
      setErrors({})
    } catch (err) {
      console.error('Failed to fetch member details:', err)
    } finally {
      setFetching(false)
    }
  }

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

    if (!selectedMemberId) {
      setErrors({ memberId: 'Please select a member' })
      return
    }

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await membersAPI.updateMember(selectedMemberId, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        membership_type: formData.membership_type,
        action: formData.action
      })

      setSuccess(
        formData.action === 'extend'
          ? '✅ Membership extended successfully!'
          : formData.action === 'cancel'
          ? '✅ Membership cancelled successfully!'
          : '✅ Member updated successfully!'
      )

      setErrors({})

      // Refresh members list
      await fetchMembers()

      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || 'Failed to update member' })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>✏️ Update Membership</h1>

      {success && <div className="success-message">{success}</div>}
      {errors.submit && <div className="error-message">{errors.submit}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Membership Number (Select Member) *</label>
          <select
            value={selectedMemberId}
            onChange={(e) => handleMemberSelect(e.target.value)}
          >
            <option value="">Select a member</option>
            {members.map(member => (
              <option key={member.id} value={member.id}>
                {member.id} - {member.name}
              </option>
            ))}
          </select>
          {errors.memberId && <div className="error">{errors.memberId}</div>}
        </div>

        {selectedMemberId && !fetching && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Member name"
                />
                {errors.name && <div className="error">{errors.name}</div>}
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Email address"
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
                  placeholder="Phone number"
                />
              </div>

              <div className="form-group">
                <label>Membership Start Date</label>
                <input
                  type="date"
                  value={formData.membership_start_date}
                  readOnly
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Membership End Date</label>
                <input
                  type="date"
                  value={formData.membership_end_date}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Action *</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="action"
                      value="extend"
                      checked={formData.action === 'extend'}
                      onChange={(e) => setFormData(prev => ({ ...prev, action: e.target.value }))}
                    />
                    Extend membership (by 6 months)
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="action"
                      value="cancel"
                      checked={formData.action === 'cancel'}
                      onChange={(e) => setFormData(prev => ({ ...prev, action: e.target.value }))}
                    />
                    Cancel membership
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="action"
                      value="update"
                      checked={formData.action === 'update'}
                      onChange={(e) => setFormData(prev => ({ ...prev, action: e.target.value }))}
                    />
                    Update member details
                  </label>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Updating...' : '✅ Update'}
            </button>
          </>
        )}

        {fetching && <div className="loading">Loading member details...</div>}
      </form>
    </div>
  )
}

export default UpdateMembership
