import React from 'react'
import { useNavigate } from 'react-router-dom'

function Navbar({ user, onLogout }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <div className="navbar">
      <h1>📚 Library Management System</h1>
      <div className="navbar-right">
        <span>Welcome, {user.name} ({user.role})</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  )
}

export default Navbar
