import React, { useState, useEffect } from 'react'
import { transactionsAPI, membersAPI, booksAPI, reportsAPI } from '../services/api'

function Dashboard({ user }) {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalBooks: 0,
    issuedBooks: 0,
    pendingFines: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [membersRes, booksRes, transactionsRes, reportsRes] = await Promise.all([
        membersAPI.getAllMembers(),
        booksAPI.getAllBooks(),
        transactionsAPI.getAllTransactions(),
        reportsAPI.getPendingFinesReport()
      ])

      const totalBooks = booksRes.data.length
      const issuedBooks = booksRes.data.filter(b => b.status === 'issued').length
      const pendingFines = reportsRes.data.length

      setStats({
        totalMembers: membersRes.data.length,
        totalBooks,
        issuedBooks,
        pendingFines
      })
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div>
      <h1>📊 Dashboard</h1>
      <p>Welcome, {user.name}! ({user.role.toUpperCase()})</p>

      {error && <div className="error-message">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '30px' }}>
        {/* Stat Card - Members */}
        <div style={{ backgroundColor: '#3498db', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '32px', margin: '10px 0' }}>{stats.totalMembers}</h3>
          <p style={{ fontSize: '16px' }}>Total Members</p>
        </div>

        {/* Stat Card - Books */}
        <div style={{ backgroundColor: '#27ae60', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '32px', margin: '10px 0' }}>{stats.totalBooks}</h3>
          <p style={{ fontSize: '16px' }}>Total Books</p>
        </div>

        {/* Stat Card - Issued */}
        <div style={{ backgroundColor: '#f39c12', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '32px', margin: '10px 0' }}>{stats.issuedBooks}</h3>
          <p style={{ fontSize: '16px' }}>Books Issued</p>
        </div>

        {/* Stat Card - Pending Fines */}
        <div style={{ backgroundColor: '#e74c3c', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '32px', margin: '10px 0' }}>{stats.pendingFines}</h3>
          <p style={{ fontSize: '16px' }}>Pending Fines</p>
        </div>
      </div>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#ecf0f1', borderRadius: '8px' }}>
        <h3>Quick Access</h3>
        <p style={{ margin: '15px 0' }}>Use the sidebar to navigate to different modules:</p>
        <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
          <li><strong>Transactions:</strong> Search and return books, pay fines</li>
          <li><strong>Membership:</strong> View membership information</li>
          {user.role === 'admin' && <li><strong>Member Management:</strong> Add and update members (Admin only)</li>}
          {user.role === 'admin' && <li><strong>Maintenance:</strong> Add and update books, manage users (Admin only)</li>}
          <li><strong>Reports:</strong> View transaction history, membership reports, and pending fines</li>
        </ul>
      </div>
    </div>
  )
}

export default Dashboard
