import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { db } from '../db.js';

const router = Router();

router.get('/', authMiddleware, (req: AuthRequest, res) => {
  const achievements = db.prepare(`
    SELECT a.*, ua.unlocked_at
    FROM achievements a
    LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
    ORDER BY a.id
  `).all(req.userId);

  res.json(achievements);
});

router.get('/:userId', authMiddleware, (req: AuthRequest, res) => {
  const achievements = db.prepare(`
    SELECT a.*, ua.unlocked_at
    FROM achievements a
    LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
    ORDER BY a.id
  `).all(req.params.userId);

  res.json(achievements);
});

export default router;
