import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { db } from '../db.js';

const router = Router();

router.get('/', authMiddleware, (req: AuthRequest, res) => {
  const settings = db.prepare('SELECT * FROM settings WHERE user_id = ?').get(req.userId) as any;
  
  if (!settings) {
    db.prepare('INSERT INTO settings (user_id) VALUES (?)').run(req.userId);
    return res.json({ notifications_enabled: 1, location_tracking: 1, privacy_profile: 'public', privacy_activities: 'public', theme: 'system' });
  }

  res.json(settings);
});

router.put('/', authMiddleware, (req: AuthRequest, res) => {
  const { notifications_enabled, location_tracking, privacy_profile, privacy_activities, theme } = req.body;

  db.prepare(`
    UPDATE settings 
    SET notifications_enabled = ?, location_tracking = ?, privacy_profile = ?, privacy_activities = ?, theme = ?
    WHERE user_id = ?
  `).run(notifications_enabled, location_tracking, privacy_profile, privacy_activities, theme, req.userId);

  res.json({ success: true });
});

export default router;
