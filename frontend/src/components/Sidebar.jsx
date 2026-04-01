import React from 'react'
import { Link, useLocation } from 'react-router-dom'

function Sidebar({ user }) {
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path ? 'active' : ''
  }

  return (
    <div className="sidebar">
      <nav>
        <Link to="/" className={isActive('/')}>📊 Dashboard</Link>

        {/* Transaction Links */}
        <div style={{ marginTop: '15px', fontWeight: 'bold', fontSize: '12px', color: '#7f8c8d', paddingLeft: '5px' }}>Transactions</div>
        <Link to="/book-available" className={isActive('/book-available')}>📖 Book Available</Link>
        <Link to="/return-book" className={isActive('/return-book')}>📥 Return Book</Link>

        {/* Membership Links */}
        <div style={{ marginTop: '15px', fontWeight: 'bold', fontSize: '12px', color: '#7f8c8d', paddingLeft: '5px' }}>Membership</div>
        <Link to="/view-membership" className={isActive('/view-membership')}>👤 View Membership</Link>

        {/* Admin Membership Links */}
        {user.role === 'admin' && (
          <>
            <Link to="/add-membership" className={isActive('/add-membership')}>➕ Add Member</Link>
            <Link to="/update-membership" className={isActive('/update-membership')}>✏️ Update Member</Link>
          </>
        )}

        {/* Admin Links */}
        {user.role === 'admin' && (
          <>
            <div style={{ marginTop: '15px', fontWeight: 'bold', fontSize: '12px', color: '#7f8c8d', paddingLeft: '5px' }}>Maintenance</div>
            <Link to="/add-book" className={isActive('/add-book')}>📕 Add Book</Link>
            <Link to="/update-book" className={isActive('/update-book')}>📗 Update Book</Link>
            <Link to="/user-management" className={isActive('/user-management')}>👥 User Management</Link>
          </>
        )}

        {/* Reports Links */}
        <div style={{ marginTop: '15px', fontWeight: 'bold', fontSize: '12px', color: '#7f8c8d', paddingLeft: '5px' }}>Reports</div>
        <Link to="/reports" className={isActive('/reports')}>📑 Reports</Link>
        <Link to="/transactions" className={isActive('/transactions')}>📋 Transactions</Link>
      </nav>
    </div>
  )
}

export default Sidebar
