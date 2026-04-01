import React, { useState, useEffect } from 'react'
import { booksAPI } from '../services/api'

function UpdateBook() {
  const [books, setBooks] = useState([])
  const [selectedBookId, setSelectedBookId] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    serial_no: '',
    remarks: ''
  })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      const response = await booksAPI.getAllBooks()
      setBooks(response.data)
    } catch (err) {
      console.error('Failed to fetch books:', err)
    }
  }

  const handleBookSelect = async (bookId) => {
    setSelectedBookId(bookId)
    setFetching(true)

    try {
      const response = await booksAPI.getBook(bookId)
      const book = response.data

      setFormData({
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        serial_no: book.serial_no,
        remarks: book.remarks
      })
      setErrors({})
    } catch (err) {
      console.error('Failed to fetch book details:', err)
    } finally {
      setFetching(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.author.trim()) newErrors.author = 'Author is required'
    if (!formData.serial_no.trim()) newErrors.serial_no = 'Serial number is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedBookId) {
      setErrors({ bookId: 'Please select a book' })
      return
    }

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await booksAPI.updateBook(selectedBookId, formData)

      setSuccess('✅ Book updated successfully!')
      setErrors({})

      // Refresh books list
      await fetchBooks()

      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || 'Failed to update book' })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>📗 Update Book</h1>

      {success && <div className="success-message">{success}</div>}
      {errors.submit && <div className="error-message">{errors.submit}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Select Book *</label>
          <select
            value={selectedBookId}
            onChange={(e) => handleBookSelect(e.target.value)}
          >
            <option value="">Select a book</option>
            {books.map(book => (
              <option key={book.id} value={book.id}>
                {book.title} by {book.author}
              </option>
            ))}
          </select>
          {errors.bookId && <div className="error">{errors.bookId}</div>}
        </div>

        {selectedBookId && !fetching && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter title"
                />
                {errors.title && <div className="error">{errors.title}</div>}
              </div>

              <div className="form-group">
                <label>Author *</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="Enter author name"
                />
                {errors.author && <div className="error">{errors.author}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>ISBN</label>
                <input
                  type="text"
                  value={formData.isbn}
                  onChange={(e) => setFormData(prev => ({ ...prev, isbn: e.target.value }))}
                  placeholder="Enter ISBN"
                />
              </div>

              <div className="form-group">
                <label>Serial Number *</label>
                <input
                  type="text"
                  value={formData.serial_no}
                  onChange={(e) => setFormData(prev => ({ ...prev, serial_no: e.target.value }))}
                  placeholder="Enter serial number"
                />
                {errors.serial_no && <div className="error">{errors.serial_no}</div>}
              </div>
            </div>

            <div className="form-row full">
              <div className="form-group">
                <label>Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                  placeholder="Enter any remarks"
                />
              </div>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Updating...' : '✅ Update Book'}
            </button>
          </>
        )}

        {fetching && <div className="loading">Loading book details...</div>}
      </form>
    </div>
  )
}

export default UpdateBook
