import React, { useState, useEffect } from 'react'
import { membersAPI } from '../services/api'

function ViewMembership() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const response = await membersAPI.getAllMembers()
      setMembers(response.data)
    } catch (err) {
      setError('Failed to load membership information')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading membership information...</div>
  }

  return (
    <div>
      <h1>👤 View Membership</h1>

      {error && <div className="error-message">{error}</div>}

      {members.length === 0 ? (
        <div className="message info">No active members found</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Membership Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {members.map(member => (
              <tr key={member.id}>
                <td>{member.id}</td>
                <td>{member.name}</td>
                <td>{member.email || '-'}</td>
                <td>{member.phone || '-'}</td>
                <td>{member.membership_type}</td>
                <td>{member.membership_start_date}</td>
                <td>{member.membership_end_date}</td>
                <td>
                  <span style={{
                    backgroundColor: member.status === 'active' ? '#d5f4e6' : '#fadbd8',
                    color: member.status === 'active' ? '#27ae60' : '#c0392b',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {member.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default ViewMembership
