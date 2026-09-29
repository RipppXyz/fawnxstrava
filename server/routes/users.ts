import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { db } from '../db.js';

const router = Router();

router.get('/me', authMiddleware, (req: AuthRequest, res) => {
  const user = db.prepare('SELECT id, username, email, display_name, bio, avatar, created_at FROM users WHERE id = ?').get(req.userId) as any;
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const stats = db.prepare(`
    SELECT 
      COUNT(*) as activities_count,
      COALESCE(SUM(distance), 0) as total_distance,
      COALESCE(SUM(duration), 0) as total_duration
    FROM activities WHERE user_id = ?
  `).get(req.userId) as any;

  const followersCount = db.prepare('SELECT COUNT(*) as count FROM followers WHERE following_id = ?').get(req.userId) as any;
  const followingCount = db.prepare('SELECT COUNT(*) as count FROM followers WHERE follower_id = ?').get(req.userId) as any;

  res.json({
    ...user,
    stats: {
      activities: stats.activities_count,
      distance: stats.total_distance,
      duration: stats.total_duration,
      followers: followersCount.count,
      following: followingCount.count
    }
  });
});

router.get('/:id', authMiddleware, (req: AuthRequest, res) => {
  const user = db.prepare('SELECT id, username, display_name, bio, avatar, created_at FROM users WHERE id = ?').get(req.params.id) as any;
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const stats = db.prepare(`
    SELECT 
      COUNT(*) as activities_count,
      COALESCE(SUM(distance), 0) as total_distance,
      COALESCE(SUM(duration), 0) as total_duration
    FROM activities WHERE user_id = ?
  `).get(req.params.id) as any;

  const followersCount = db.prepare('SELECT COUNT(*) as count FROM followers WHERE following_id = ?').get(req.params.id) as any;
  const followingCount = db.prepare('SELECT COUNT(*) as count FROM followers WHERE follower_id = ?').get(req.params.id) as any;
  const isFollowing = db.prepare('SELECT id FROM followers WHERE follower_id = ? AND following_id = ?').get(req.userId, req.params.id);

  res.json({
    ...user,
    stats: {
      activities: stats.activities_count,
      distance: stats.total_distance,
      duration: stats.total_duration,
      followers: followersCount.count,
      following: followingCount.count
    },
    isFollowing: !!isFollowing
  });
});

router.put('/me', authMiddleware, (req: AuthRequest, res) => {
  const { displayName, bio, avatar } = req.body;

  db.prepare('UPDATE users SET display_name = ?, bio = ?, avatar = ? WHERE id = ?')
    .run(displayName, bio, avatar, req.userId);

  res.json({ success: true });
});

router.get('/search', authMiddleware, (req: AuthRequest, res) => {
  const { q } = req.query;
  
  if (!q || typeof q !== 'string') {
    return res.json([]);
  }

  const users = db.prepare(`
    SELECT id, username, display_name, avatar 
    FROM users 
    WHERE username LIKE ? OR display_name LIKE ?
    LIMIT 20
  `).all(`%${q}%`, `%${q}%`);

  res.json(users);
});

export default router;
