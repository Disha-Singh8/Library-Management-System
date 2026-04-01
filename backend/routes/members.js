import express from 'express';
import { runQuery, runUpdate, runQuerySingle } from '../db.js';

const router = express.Router();

// Calculate membership end date
function calculateMembershipEndDate(startDate, membershipType) {
  const start = new Date(startDate);
  const end = new Date(start);

  if (membershipType === '6 months') {
    end.setMonth(end.getMonth() + 6);
  } else if (membershipType === '1 year') {
    end.setFullYear(end.getFullYear() + 1);
  } else if (membershipType === '2 years') {
    end.setFullYear(end.getFullYear() + 2);
  }

  return end.toISOString().split('T')[0];
}

// Get all members
router.get('/', async (req, res) => {
  try {
    const members = await runQuery('SELECT * FROM members WHERE status = ? ORDER BY created_at DESC', ['active']);
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get member by id
router.get('/:id', async (req, res) => {
  try {
    const member = await runQuerySingle('SELECT * FROM members WHERE id = ?', [req.params.id]);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add member
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, membership_type } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const today = new Date().toISOString().split('T')[0];
    const endDate = calculateMembershipEndDate(today, membership_type || '6 months');

    const result = await runUpdate(
      'INSERT INTO members (name, email, phone, membership_type, membership_start_date, membership_end_date) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone, membership_type || '6 months', today, endDate]
    );

    res.json({ message: 'Member added successfully', memberId: result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update membership
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, membership_type, action } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const member = await runQuerySingle('SELECT * FROM members WHERE id = ?', [req.params.id]);

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    let newEndDate = member.membership_end_date;

    if (action === 'extend') {
      // Extend membership by 6 months (default or specified)
      newEndDate = calculateMembershipEndDate(member.membership_end_date, '6 months');
    } else if (action === 'cancel') {
      // Cancel membership
      await runUpdate('UPDATE members SET status = ? WHERE id = ?', ['cancelled', req.params.id]);
      return res.json({ message: 'Membership cancelled successfully' });
    } else {
      // Regular update
      newEndDate = calculateMembershipEndDate(new Date().toISOString().split('T')[0], membership_type || member.membership_type);
    }

    await runUpdate(
      'UPDATE members SET name = ?, email = ?, phone = ?, membership_type = ?, membership_end_date = ? WHERE id = ?',
      [name, email, phone, membership_type || member.membership_type, newEndDate, req.params.id]
    );

    res.json({ message: 'Member updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get member by name (for transactions)
router.get('/name/:name', async (req, res) => {
  try {
    const member = await runQuerySingle('SELECT * FROM members WHERE name = ? AND status = ?', [req.params.name, 'active']);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
