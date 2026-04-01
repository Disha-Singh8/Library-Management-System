import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { authAPI } from './services/api'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import BookAvailable from './pages/BookAvailable'
import ReturnBook from './pages/ReturnBook'
import PayFine from './pages/PayFine'
import ViewMembership from './pages/ViewMembership'
import AddMembership from './pages/AddMembership'
import UpdateMembership from './pages/UpdateMembership'
import AddBook from './pages/AddBook'
import UpdateBook from './pages/UpdateBook'
import UserManagement from './pages/UserManagement'
import Reports from './pages/Reports'
import Transactions from './pages/Transactions'

// Components
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (token) {
      const userData = localStorage.getItem('user')
      if (userData) {
        setUser(JSON.parse(userData))
      }
    }
    setLoading(false)
  }, [])

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    )
  }

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      <div className="main-content">
        <Sidebar user={user} />
        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />

            {/* Transaction Routes */}
            <Route path="/book-available" element={<BookAvailable />} />
            <Route path="/return-book" element={<ReturnBook />} />
            <Route path="/pay-fine/:transactionId" element={<PayFine />} />

            {/* Membership Routes (View for all users) */}
            <Route path="/view-membership" element={<ViewMembership />} />

            {/* Admin Only Routes */}
            {user.role === 'admin' && (
              <>
                <Route path="/add-membership" element={<AddMembership />} />
                <Route path="/update-membership" element={<UpdateMembership />} />
                <Route path="/add-book" element={<AddBook />} />
                <Route path="/update-book" element={<UpdateBook />} />
                <Route path="/user-management" element={<UserManagement />} />
              </>
            )}

            {/* Reports Routes */}
            <Route path="/reports" element={<Reports user={user} />} />
            <Route path="/transactions" element={<Transactions />} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
