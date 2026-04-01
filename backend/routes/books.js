import express from 'express';
import { runQuery, runUpdate, runQuerySingle } from '../db.js';

const router = express.Router();

// Get all books
router.get('/', async (req, res) => {
  try {
    const books = await runQuery('SELECT * FROM books ORDER BY created_at DESC');
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search books by title or author
router.get('/search', async (req, res) => {
  try {
    const { title, author, status } = req.query;

    let query = 'SELECT * FROM books WHERE 1=1';
    const params = [];

    if (title) {
      query += ' AND title LIKE ?';
      params.push(`%${title}%`);
    }

    if (author) {
      query += ' AND author LIKE ?';
      params.push(`%${author}%`);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    const books = await runQuery(query, params);
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get book by id
router.get('/:id', async (req, res) => {
  try {
    const book = await runQuerySingle('SELECT * FROM books WHERE id = ?', [req.params.id]);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add book
router.post('/', async (req, res) => {
  try {
    const { title, author, isbn, serial_no, remarks } = req.body;

    if (!title || !author || !serial_no) {
      return res.status(400).json({ error: 'Title, author, and serial number are required' });
    }

    const result = await runUpdate(
      'INSERT INTO books (title, author, isbn, serial_no, remarks) VALUES (?, ?, ?, ?, ?)',
      [title, author, isbn, serial_no, remarks]
    );

    res.json({ message: 'Book added successfully', bookId: result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update book
router.put('/:id', async (req, res) => {
  try {
    const { title, author, isbn, serial_no, status, remarks } = req.body;

    if (!title || !author || !serial_no) {
      return res.status(400).json({ error: 'Title, author, and serial number are required' });
    }

    await runUpdate(
      'UPDATE books SET title = ?, author = ?, isbn = ?, serial_no = ?, status = ?, remarks = ? WHERE id = ?',
      [title, author, isbn, serial_no, status, remarks, req.params.id]
    );

    res.json({ message: 'Book updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available books
router.get('/available/list', async (req, res) => {
  try {
    const books = await runQuery('SELECT id, title, author, serial_no FROM books WHERE status = ?', ['available']);
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
