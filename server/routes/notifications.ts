import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { query, queryOne, execute } from '../db.js';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const notifications = await query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50', [req.userId]);
  res.json(notifications);
});

router.put('/:id/read', authMiddleware, async (req: AuthRequest, res) => {
  await execute('UPDATE notifications SET is_read = 1 WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
  res.json({ success: true });
});

router.put('/read-all', authMiddleware, async (req: AuthRequest, res) => {
  await execute('UPDATE notifications SET is_read = 1 WHERE user_id = $1', [req.userId]);
  res.json({ success: true });
});

router.get('/unread-count', authMiddleware, async (req: AuthRequest, res) => {
  const result = await queryOne('SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = 0', [req.userId]) as any;
  res.json({ count: result.count });
});

export default router;
