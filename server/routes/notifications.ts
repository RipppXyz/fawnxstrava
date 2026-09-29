import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { db } from '../db.js';

const router = Router();

router.get('/', authMiddleware, (req: AuthRequest, res) => {
  const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(req.userId);
  res.json(notifications);
});

router.put('/:id/read', authMiddleware, (req: AuthRequest, res) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  res.json({ success: true });
});

router.put('/read-all', authMiddleware, (req: AuthRequest, res) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.userId);
  res.json({ success: true });
});

router.get('/unread-count', authMiddleware, (req: AuthRequest, res) => {
  const result = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(req.userId) as any;
  res.json({ count: result.count });
});

export default router;
