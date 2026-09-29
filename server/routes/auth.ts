import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { queryOne, execute } from '../db.js';

const router = Router();

// GitHub OAuth callback
router.post('/github', async (req, res) => {
  try {
    const { githubId, username, email, avatar, name } = req.body;

    if (!githubId || !username) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    let user = await queryOne('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);

    if (!user) {
      // Create new user
      const now = Date.now();
      const result = await execute(
        'INSERT INTO users (username, email, password, display_name, avatar, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [username, email || `${username}@github.oauth`, 'oauth', name || username, avatar, now]
      );

      const userId = result.rows[0].id;
      await execute('INSERT INTO settings (user_id) VALUES ($1)', [userId]);

      user = { id: userId, username, email, display_name: name || username };
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'dev-secret-key', { expiresIn: '30d' });

    res.json({ token, userId: user.id, username: user.username });
  } catch (error) {
    console.error('GitHub auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

export default router;
