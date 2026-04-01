import React, { useState, useEffect } from 'react'
import { booksAPI, membersAPI, transactionsAPI } from '../services/api'

function BookIssue() {
  const [formData, setFormData] = useState({
    member_id: '',
    book_id: '',
    book_title: '',
    issue_date: '',
    return_date: '',
    remarks: ''
  })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [books, setBooks] = useState([])
  const [members, setMembers] = useState([])
  const [author, setAuthor] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [booksRes, membersRes] = await Promise.all([
        booksAPI.getAvailableBooks(),
        membersAPI.getAllMembers()
      ])
      setBooks(booksRes.data)
      setMembers(membersRes.data)

      // Set today's date as default issue date
      const today = new Date().toISOString().split('T')[0]
      setFormData(prev => ({ ...prev, issue_date: today }))
    } catch (err) {
      console.error('Failed to fetch data:', err)
    }
  }

  const handleBookChange = async (e) => {
    const bookId = e.target.value
    setFormData(prev => ({ ...prev, book_id: bookId }))

    if (bookId) {
      const book = books.find(b => b.id === parseInt(bookId))
      if (book) {
        setAuthor(book.author)
        setFormData(prev => ({ ...prev, book_title: book.title }))
      }
    } else {
      setAuthor('')
      setFormData(prev => ({ ...prev, book_title: '' }))
    }
  }

  const handleDateChange = (e) => {
    const issueDate = e.target.value
    setFormData(prev => ({ ...prev, issue_date: issueDate }))

    // Auto-calculate return date (15 days ahead)
    if (issueDate) {
      const date = new Date(issueDate)
      date.setDate(date.getDate() + 15)
      const returnDate = date.toISOString().split('T')[0]
      setFormData(prev => ({ ...prev, return_date: returnDate }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    const today = new Date().toISOString().split('T')[0]

    if (!formData.member_id) newErrors.member_id = 'Member is required'
    if (!formData.book_id) newErrors.book_id = 'Book is required'
    if (!formData.issue_date) newErrors.issue_date = 'Issue date is required'
    if (formData.issue_date < today) newErrors.issue_date = 'Issue date cannot be less than today'
    if (!formData.return_date) newErrors.return_date = 'Return date is required'

    // Check return date is not more than 15 days from issue date
    const issueDate = new Date(formData.issue_date)
    const returnDate = new Date(formData.return_date)
    const daysDiff = (returnDate - issueDate) / (1000 * 60 * 60 * 24)

    if (daysDiff > 15) {
      newErrors.return_date = 'Return date cannot be more than 15 days from issue date'
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
      await transactionsAPI.issueBook({
        member_id: parseInt(formData.member_id),
        book_id: parseInt(formData.book_id),
        issue_date: formData.issue_date,
        return_date: formData.return_date,
        remarks: formData.remarks
      })

      setSuccess('✅ Book issued successfully!')
      setFormData({
        member_id: '',
        book_id: '',
        book_title: '',
        issue_date: new Date().toISOString().split('T')[0],
        return_date: '',
        remarks: ''
      })
      setAuthor('')
      setErrors({})

      // Re-fetch data to update available books
      fetchData()

      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || 'Failed to issue book' })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>📤 Issue Book</h1>

      {success && <div className="success-message">{success}</div>}
      {errors.submit && <div className="error-message">{errors.submit}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Member Name *</label>
            <select
              value={formData.member_id}
              onChange={(e) => setFormData(prev => ({ ...prev, member_id: e.target.value }))}
            >
              <option value="">Select a member</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
            {errors.member_id && <div className="error">{errors.member_id}</div>}
          </div>

          <div className="form-group">
            <label>Book Name/Title *</label>
            <select
              value={formData.book_id}
              onChange={handleBookChange}
            >
              <option value="">Select a book</option>
              {books.map(book => (
                <option key={book.id} value={book.id}>{book.title}</option>
              ))}
            </select>
            {errors.book_id && <div className="error">{errors.book_id}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Author Name (Non-editable)</label>
            <input
              type="text"
              value={author}
              readOnly
              placeholder="Author will be populated automatically"
            />
          </div>

          <div className="form-group">
            <label>Issue Date *</label>
            <input
              type="date"
              value={formData.issue_date}
              onChange={handleDateChange}
            />
            {errors.issue_date && <div className="error">{errors.issue_date}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Return Date (Default: +15 days) *</label>
            <input
              type="date"
              value={formData.return_date}
              onChange={(e) => setFormData(prev => ({ ...prev, return_date: e.target.value }))}
            />
            {errors.return_date && <div className="error">{errors.return_date}</div>}
          </div>

          <div className="form-group">
            <label>Remarks (Optional)</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
              placeholder="Enter any remarks"
            />
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Issuing...' : '✅ Issue Book'}
        </button>
      </form>
    </div>
  )
}

export default BookIssue
