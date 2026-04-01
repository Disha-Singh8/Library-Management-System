import express from 'express';
import { runQuery } from '../db.js';

const router = express.Router();

// Get all transactions report
router.get('/transactions', async (req, res) => {
  try {
    const report = await runQuery(
      `SELECT t.id, t.issue_date, t.return_date, t.actual_return_date, t.status,
              b.title, b.author, b.serial_no,
              m.name as member_name, m.email, m.phone,
              f.calculated_fine, f.paid_fine, f.status as fine_status
       FROM transactions t
       JOIN books b ON t.book_id = b.id
       JOIN members m ON t.member_id = m.id
       LEFT JOIN fines f ON t.id = f.transaction_id
       ORDER BY t.created_at DESC`
    );
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get membership report
router.get('/membership', async (req, res) => {
  try {
    const report = await runQuery(
      `SELECT id, name, email, phone, membership_type, membership_start_date, membership_end_date, status
       FROM members
       ORDER BY status DESC, created_at DESC`
    );
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending fines report
router.get('/pending-fines', async (req, res) => {
  try {
    const report = await runQuery(
      `SELECT t.id as transaction_id, b.title, b.author, m.name as member_name,
              t.issue_date, t.return_date, t.actual_return_date,
              f.calculated_fine, f.paid_fine
       FROM transactions t
       JOIN books b ON t.book_id = b.id
       JOIN members m ON t.member_id = m.id
       JOIN fines f ON t.id = f.transaction_id
       WHERE f.status = 'pending'
       ORDER BY t.actual_return_date DESC`
    );
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get books report
router.get('/books', async (req, res) => {
  try {
    const report = await runQuery(
      `SELECT id, title, author, type, isbn, serial_no, status
       FROM books
       ORDER BY status DESC, created_at DESC`
    );
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
