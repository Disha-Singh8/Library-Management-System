import React, { useState, useEffect } from 'react'
import { booksAPI } from '../services/api'

function BookAvailable() {
  const [searchTitle, setSearchTitle] = useState('')
  const [searchAuthor, setSearchAuthor] = useState('')
  const [results, setResults] = useState([])
  const [error, setError] = useState('')
  const [selectedBook, setSelectedBook] = useState(null)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    setError('')
    setResults([])
    setSelectedBook(null)

    if (!searchTitle.trim() && !searchAuthor.trim()) {
      setError('Please enter either a book title or author name')
      return
    }

    try {
      const params = {
        status: 'available'
      }
      if (searchTitle.trim()) params.title = searchTitle
      if (searchAuthor.trim()) params.author = searchAuthor

      const response = await booksAPI.searchBooks(params)
      setResults(response.data)
      setSearched(true)

      if (response.data.length === 0) {
        setError('No books found matching your search')
      }
    } catch (err) {
      setError('Failed to search books')
      console.error(err)
    }
  }

  const handleSelectBook = (bookId) => {
    const book = results.find(b => b.id === bookId)
    setSelectedBook(book)
  }

  return (
    <div>
      <h1>📖 Book Available</h1>

      <form onSubmit={handleSearch}>
        <div className="form-row">
          <div className="form-group">
            <label>Book Title</label>
            <input
              type="text"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              placeholder="Enter book title"
            />
          </div>
          <div className="form-group">
            <label>Author Name</label>
            <input
              type="text"
              value={searchAuthor}
              onChange={(e) => setSearchAuthor(e.target.value)}
              placeholder="Enter author name"
            />
          </div>
        </div>

        <button type="submit">🔍 Search</button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {searched && results.length > 0 && (
        <div className="search-results">
          <h3>Available Books</h3>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Serial No</th>
                <th>Select</th>
              </tr>
            </thead>
            <tbody>
              {results.map(book => (
                <tr key={book.id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.serial_no}</td>
                  <td>
                    <input
                      type="radio"
                      name="selectedBook"
                      value={book.id}
                      onChange={() => handleSelectBook(book.id)}
                      checked={selectedBook?.id === book.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {selectedBook && (
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#d5f4e6', borderRadius: '4px' }}>
              <p><strong>Selected Book:</strong> {selectedBook.title} by {selectedBook.author}</p>
              <p><strong>Serial No:</strong> {selectedBook.serial_no}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BookAvailable
