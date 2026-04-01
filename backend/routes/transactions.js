import express from 'express';
import { runQuery, runUpdate, runQuerySingle } from '../db.js';

const router = express.Router();
const DAILY_FINE_RATE = 5; // $5 per day

// Get all transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await runQuery(
      `SELECT t.*, b.title, b.author, m.name as member_name, f.calculated_fine, f.paid_fine, f.status as fine_status
       FROM transactions t
       JOIN books b ON t.book_id = b.id
       JOIN members m ON t.member_id = m.id
       LEFT JOIN fines f ON t.id = f.transaction_id
       ORDER BY t.created_at DESC`
    );
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transaction by id
router.get('/:id', async (req, res) => {
  try {
    const transaction = await runQuerySingle(
      `SELECT t.*, b.title, b.author, b.serial_no, m.name as member_name, f.calculated_fine, f.paid_fine, f.status as fine_status
       FROM transactions t
       JOIN books b ON t.book_id = b.id
       JOIN members m ON t.member_id = m.id
       LEFT JOIN fines f ON t.id = f.transaction_id
       WHERE t.id = ?`,
      [req.params.id]
    );

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Issue book
router.post('/issue', async (req, res) => {
  try {
    const { member_id, book_id, issue_date, return_date, remarks } = req.body;

    if (!member_id || !book_id || !issue_date) {
      return res.status(400).json({ error: 'Member ID, book ID, and issue date are required' });
    }

    const today = new Date().toISOString().split('T')[0];
    if (new Date(issue_date) < new Date(today)) {
      return res.status(400).json({ error: 'Issue date cannot be less than today' });
    }

    // Check book status
    const book = await runQuerySingle('SELECT * FROM books WHERE id = ?', [book_id]);
    if (!book || book.status !== 'available') {
      return res.status(400).json({ error: 'Book is not available' });
    }

    // Calculate default return date (15 days from issue date)
    const issueDateObj = new Date(issue_date);
    const defaultReturnDate = new Date(issueDateObj);
    defaultReturnDate.setDate(defaultReturnDate.getDate() + 15);
    const returnDateStr = return_date || defaultReturnDate.toISOString().split('T')[0];

    // Validate return date
    if (new Date(returnDateStr) - new Date(issue_date) > 15 * 24 * 60 * 60 * 1000) {
      return res.status(400).json({ error: 'Return date cannot be more than 15 days after issue date' });
    }

    const transResult = await runUpdate(
      'INSERT INTO transactions (member_id, book_id, issue_date, return_date, remarks) VALUES (?, ?, ?, ?, ?)',
      [member_id, book_id, issue_date, returnDateStr, remarks]
    );

    // Update book status
    await runUpdate('UPDATE books SET status = ? WHERE id = ?', ['issued', book_id]);

    // Create fine record (initially 0)
    await runUpdate(
      'INSERT INTO fines (transaction_id, calculated_fine, paid_fine) VALUES (?, ?, ?)',
      [transResult.id, 0, 0]
    );

    res.json({ message: 'Book issued successfully', transactionId: transResult.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Return book
router.post('/return/:id', async (req, res) => {
  try {
    const { actual_return_date, remarks } = req.body;

    if (!actual_return_date) {
      return res.status(400).json({ error: 'Actual return date is required' });
    }

    const transaction = await runQuerySingle('SELECT * FROM transactions WHERE id = ?', [req.params.id]);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status === 'returned') {
      return res.status(400).json({ error: 'Book already returned' });
    }

    // Calculate fine
    const returnDate = new Date(transaction.return_date);
    const actualReturnDate = new Date(actual_return_date);
    const daysLate = Math.max(0, Math.floor((actualReturnDate - returnDate) / (1000 * 60 * 60 * 24)));
    const calculatedFine = daysLate * DAILY_FINE_RATE;

    // Update transaction
    await runUpdate(
      'UPDATE transactions SET actual_return_date = ?, remarks = ?, status = ? WHERE id = ?',
      [actual_return_date, remarks, 'returned', req.params.id]
    );

    // Update fine
    await runUpdate(
      'UPDATE fines SET calculated_fine = ? WHERE transaction_id = ?',
      [calculatedFine, req.params.id]
    );

    // Update book status
    await runUpdate('UPDATE books SET status = ? WHERE id = ?', ['available', transaction.book_id]);

    res.json({ message: 'Book return processed', fine: calculatedFine, transactionId: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pay fine
router.post('/pay-fine/:transaction_id', async (req, res) => {
  try {
    const { paid_fine } = req.body;

    const fine = await runQuerySingle('SELECT * FROM fines WHERE transaction_id = ?', [req.params.transaction_id]);

    if (!fine) {
      return res.status(404).json({ error: 'Fine not found' });
    }

    if (paid_fine < fine.calculated_fine) {
      return res.status(400).json({ error: 'Paid fine cannot be less than calculated fine' });
    }

    // Update fine status
    await runUpdate(
      'UPDATE fines SET paid_fine = ?, status = ? WHERE transaction_id = ?',
      [paid_fine, 'paid', req.params.transaction_id]
    );

    res.json({ message: 'Fine paid successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get issued books (for return)
router.get('/issued/books', async (req, res) => {
  try {
    const books = await runQuery(
      `SELECT t.id as transaction_id, b.id, b.title, b.author, b.serial_no, t.issue_date, t.return_date, m.id as member_id
       FROM transactions t
       JOIN books b ON t.book_id = b.id
       JOIN members m ON t.member_id = m.id
       WHERE t.status = 'issued'`
    );
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
