import React, { useState } from 'react'
import { booksAPI } from '../services/api'

function AddBook() {
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

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await booksAPI.addBook(formData)

      setSuccess('✅ Book added successfully!')
      setFormData({
        title: '',
        author: '',
        isbn: '',
        serial_no: '',
        remarks: ''
      })
      setErrors({})

      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || 'Failed to add book' })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>📕 Add Book</h1>

      {success && <div className="success-message">{success}</div>}
      {errors.submit && <div className="error-message">{errors.submit}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter book title"
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
              placeholder="Enter unique serial number"
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
          {loading ? 'Adding...' : '✅ Add Book'}
        </button>
      </form>
    </div>
  )
}

export default AddBook
