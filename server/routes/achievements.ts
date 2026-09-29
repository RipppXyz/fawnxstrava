import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { query } from '../db.js';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const achievements = await query(`
    SELECT a.*, ua.unlocked_at
    FROM achievements a
    LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = $1
    ORDER BY a.id
  `, [req.userId]);

  res.json(achievements);
});

router.get('/:userId', authMiddleware, async (req: AuthRequest, res) => {
  const achievements = await query(`
    SELECT a.*, ua.unlocked_at
    FROM achievements a
    LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = $1
    ORDER BY a.id
  `, [req.params.userId]);

  res.json(achievements);
});

export default router;
