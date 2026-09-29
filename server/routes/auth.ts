import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const now = Date.now();

    try {
      const result = db.prepare(
        'INSERT INTO users (username, email, password, display_name, created_at) VALUES (?, ?, ?, ?, ?)'
      ).run(username, email, hashedPassword, displayName || username, now);

      const userId = result.lastInsertRowid as number;

      db.prepare('INSERT INTO settings (user_id) VALUES (?)').run(userId);

      const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'dev-secret-key', { expiresIn: '30d' });

      res.json({ token, userId, username });
    } catch (err: any) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(400).json({ error: 'Username or email already exists' });
      }
      throw err;
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' });
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username) as any;

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'dev-secret-key', { expiresIn: '30d' });

    res.json({ token, userId: user.id, username: user.username });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
