import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { queryOne, execute } from '../db.js';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const settings = await queryOne('SELECT * FROM settings WHERE user_id = $1', [req.userId]) as any;
  
  if (!settings) {
    await execute('INSERT INTO settings (user_id) VALUES ($1)', [req.userId]);
    return res.json({ notifications_enabled: 1, location_tracking: 1, privacy_profile: 'public', privacy_activities: 'public', theme: 'system' });
  }

  res.json(settings);
});

router.put('/', authMiddleware, async (req: AuthRequest, res) => {
  const { notifications_enabled, location_tracking, privacy_profile, privacy_activities, theme } = req.body;

  await execute(`
    UPDATE settings 
    SET notifications_enabled = $1, location_tracking = $2, privacy_profile = $3, privacy_activities = $4, theme = $5
    WHERE user_id = $6
  `, [notifications_enabled, location_tracking, privacy_profile, privacy_activities, theme, req.userId]);

  res.json({ success: true });
});

export default router;
