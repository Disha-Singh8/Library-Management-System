import express from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { runQuerySingle, runUpdate, runQuery } from '../db.js';

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, role, email, phone } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ error: 'Username, password, and name are required' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const result = await runUpdate(
      'INSERT INTO users (username, password, name, role, email, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [username, hashedPassword, name, role || 'user', email, phone]
    );

    res.json({ message: 'User registered successfully', userId: result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await runQuerySingle('SELECT * FROM users WHERE username = ?', [username]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, username: user.username, role: user.role, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify token
router.post('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await runQuery('SELECT id, username, name, role, email, phone, created_at FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add/Update user
router.post('/users', async (req, res) => {
  try {
    const { id, username, password, name, role, email, phone } = req.body;

    if (!username || !name) {
      return res.status(400).json({ error: 'Username and name are required' });
    }

    if (id) {
      // Update
      const hashedPassword = password ? await bcryptjs.hash(password, 10) : null;
      const query = hashedPassword
        ? 'UPDATE users SET username = ?, password = ?, name = ?, role = ?, email = ?, phone = ? WHERE id = ?'
        : 'UPDATE users SET username = ?, name = ?, role = ?, email = ?, phone = ? WHERE id = ?';

      const params = hashedPassword
        ? [username, hashedPassword, name, role, email, phone, id]
        : [username, name, role, email, phone, id];

      await runUpdate(query, params);
      res.json({ message: 'User updated successfully' });
    } else {
      // Create new
      if (!password) {
        return res.status(400).json({ error: 'Password is required for new users' });
      }

      const hashedPassword = await bcryptjs.hash(password, 10);
      const result = await runUpdate(
        'INSERT INTO users (username, password, name, role, email, phone) VALUES (?, ?, ?, ?, ?, ?)',
        [username, hashedPassword, name, role || 'user', email, phone]
      );

      res.json({ message: 'User created successfully', userId: result.id });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
