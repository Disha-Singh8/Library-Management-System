import React, { useState, useEffect } from 'react'
import { transactionsAPI } from '../services/api'

function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await transactionsAPI.getAllTransactions()
      setTransactions(response.data)
    } catch (err) {
      setError('Failed to load transactions')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading transactions...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  return (
    <div>
      <h1>📋 Transactions</h1>

      {transactions.length === 0 ? (
        <div className="message info">No transactions found</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Book Title</th>
              <th>Author</th>
              <th>Member</th>
              <th>Issue Date</th>
              <th>Return Date</th>
              <th>Actual Return</th>
              <th>Status</th>
              <th>Fine</th>
              <th>Fine Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(trans => (
              <tr key={trans.id}>
                <td>{trans.id}</td>
                <td>{trans.title}</td>
                <td>{trans.author}</td>
                <td>{trans.member_name}</td>
                <td>{trans.issue_date}</td>
                <td>{trans.return_date}</td>
                <td>{trans.actual_return_date || '-'}</td>
                <td>{trans.status}</td>
                <td>${trans.calculated_fine ? trans.calculated_fine.toFixed(2) : '0.00'}</td>
                <td>{trans.fine_status || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Transactions
