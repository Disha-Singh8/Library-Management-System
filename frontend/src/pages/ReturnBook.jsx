import React, { useState, useEffect } from 'react'
import { transactionsAPI } from '../services/api'
import { useNavigate } from 'react-router-dom'

function ReturnBook() {
  const [searchBookTitle, setSearchBookTitle] = useState('')
  const [searchSerialNo, setSearchSerialNo] = useState('')
  const [issuedBooks, setIssuedBooks] = useState([])
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const [formData, setFormData] = useState({
    actual_return_date: '',
    remarks: ''
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchIssuedBooks()
  }, [])

  const fetchIssuedBooks = async () => {
    try {
      const response = await transactionsAPI.getIssuedBooks()
      setIssuedBooks(response.data)
    } catch (err) {
      console.error('Failed to fetch issued books:', err)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setError('')
    setErrors({})
    setSelectedTransaction(null)

    if (!searchBookTitle.trim() && !searchSerialNo.trim()) {
      setError('Please enter either book title or serial number')
      return
    }

    const filtered = issuedBooks.filter(book => {
      const titleMatch = book.title.toLowerCase().includes(searchBookTitle.toLowerCase())
      const serialMatch = book.serial_no.toLowerCase().includes(searchSerialNo.toLowerCase())
      return searchBookTitle ? titleMatch : true && searchSerialNo ? serialMatch : true
    })

    if (filtered.length === 0) {
      setError('No issued books found matching your search')
    }

    setIssuedBooks(filtered.length > 0 ? filtered : issuedBooks)
    setSearched(true)
  }

  const handleSelectBook = (transaction) => {
    setSelectedTransaction(transaction)
    setFormData({
      actual_return_date: '',
      remarks: ''
    })
    setErrors({})
  }

  const validateForm = () => {
    const newErrors = {}

    if (!selectedTransaction) newErrors.book = 'Please select a book'
    if (!formData.actual_return_date) newErrors.actual_return_date = 'Actual return date is required'

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
      const response = await transactionsAPI.returnBook(selectedTransaction.transaction_id, {
        actual_return_date: formData.actual_return_date,
        remarks: formData.remarks
      })

      // Redirect to fine payment page
      navigate(`/pay-fine/${selectedTransaction.transaction_id}`, {
        state: { fine: response.data.fine }
      })
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || 'Failed to return book' })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>📥 Return Book</h1>

      <form onSubmit={handleSearch}>
        <div className="form-row">
          <div className="form-group">
            <label>Book Title</label>
            <input
              type="text"
              value={searchBookTitle}
              onChange={(e) => setSearchBookTitle(e.target.value)}
              placeholder="Enter book title"
            />
          </div>
          <div className="form-group">
            <label>Serial Number</label>
            <input
              type="text"
              value={searchSerialNo}
              onChange={(e) => setSearchSerialNo(e.target.value)}
              placeholder="Enter serial number"
            />
          </div>
        </div>

        <button type="submit">🔍 Search</button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {searched && issuedBooks.length > 0 && (
        <div className="search-results">
          <h3>Issued Books</h3>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Serial No</th>
                <th>Issue Date</th>
                <th>Return Date</th>
                <th>Select</th>
              </tr>
            </thead>
            <tbody>
              {issuedBooks.map(book => (
                <tr key={book.transaction_id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.serial_no}</td>
                  <td>{book.issue_date}</td>
                  <td>{book.return_date}</td>
                  <td>
                    <input
                      type="radio"
                      name="selectedBook"
                      onChange={() => handleSelectBook(book)}
                      checked={selectedTransaction?.transaction_id === book.transaction_id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedTransaction && (
        <form onSubmit={handleSubmit} style={{ marginTop: '30px' }}>
          <div style={{ padding: '20px', backgroundColor: '#ecf0f1', borderRadius: '4px', marginBottom: '20px' }}>
            <h3>Book Details</h3>
            <p><strong>Book Title:</strong> {selectedTransaction.title}</p>
            <p><strong>Author:</strong> {selectedTransaction.author}</p>
            <p><strong>Serial No:</strong> {selectedTransaction.serial_no}</p>
            <p><strong>Issue Date:</strong> {selectedTransaction.issue_date}</p>
            <p><strong>Planned Return Date:</strong> {selectedTransaction.return_date}</p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Actual Return Date *</label>
              <input
                type="date"
                value={formData.actual_return_date}
                onChange={(e) => setFormData(prev => ({ ...prev, actual_return_date: e.target.value }))}
              />
              {errors.actual_return_date && <div className="error">{errors.actual_return_date}</div>}
            </div>

            <div className="form-group">
              <label>Remarks</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                placeholder="Enter any remarks"
              />
            </div>
          </div>

          {errors.submit && <div className="error-message">{errors.submit}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : '✅ Process Return'}
          </button>
        </form>
      )}
    </div>
  )
}

export default ReturnBook
