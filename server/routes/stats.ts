import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { db } from '../db.js';

const router = Router();

router.get('/dashboard', authMiddleware, (req: AuthRequest, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTs = today.getTime();

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoTs = weekAgo.getTime();

  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  const monthAgoTs = monthAgo.getTime();

  const todayStats = db.prepare(`
    SELECT 
      COUNT(*) as count,
      COALESCE(SUM(distance), 0) as distance,
      COALESCE(SUM(duration), 0) as duration
    FROM activities 
    WHERE user_id = ? AND started_at >= ?
  `).get(req.userId, todayTs) as any;

  const weekStats = db.prepare(`
    SELECT 
      COUNT(*) as count,
      COALESCE(SUM(distance), 0) as distance,
      COALESCE(SUM(duration), 0) as duration,
      COALESCE(AVG(avg_speed), 0) as avg_speed
    FROM activities 
    WHERE user_id = ? AND started_at >= ?
  `).get(req.userId, weekAgoTs) as any;

  const monthStats = db.prepare(`
    SELECT 
      COUNT(*) as count,
      COALESCE(SUM(distance), 0) as distance,
      COALESCE(SUM(duration), 0) as duration,
      COALESCE(AVG(avg_speed), 0) as avg_speed
    FROM activities 
    WHERE user_id = ? AND started_at >= ?
  `).get(req.userId, monthAgoTs) as any;

  const recentActivities = db.prepare(`
    SELECT * FROM activities 
    WHERE user_id = ? 
    ORDER BY started_at DESC 
    LIMIT 5
  `).all(req.userId);

  res.json({
    today: todayStats,
    week: weekStats,
    month: monthStats,
    recent: recentActivities
  });
});

router.get('/trends', authMiddleware, (req: AuthRequest, res) => {
  const { period = 'week' } = req.query;
  
  const days = period === 'month' ? 30 : 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startTs = startDate.getTime();

  const dailyStats = db.prepare(`
    SELECT 
      DATE(started_at / 1000, 'unixepoch') as date,
      COUNT(*) as count,
      SUM(distance) as distance,
      SUM(duration) as duration
    FROM activities 
    WHERE user_id = ? AND started_at >= ?
    GROUP BY date
    ORDER BY date
  `).all(req.userId, startTs);

  res.json(dailyStats);
});

export default router;
