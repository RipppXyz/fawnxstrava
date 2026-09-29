import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { query, queryOne, execute } from '../db.js';

const router = Router();

router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  const user = await queryOne('SELECT id, username, email, display_name, bio, avatar, created_at FROM users WHERE id = $1', [req.userId]);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const stats = await queryOne(`
    SELECT 
      COUNT(*) as activities_count,
      COALESCE(SUM(distance), 0) as total_distance,
      COALESCE(SUM(duration), 0) as total_duration
    FROM activities WHERE user_id = $1
  `, [req.userId]);

  const followersCount = await queryOne('SELECT COUNT(*) as count FROM followers WHERE following_id = $1', [req.userId]);
  const followingCount = await queryOne('SELECT COUNT(*) as count FROM followers WHERE follower_id = $1', [req.userId]);

  res.json({
    ...user,
    stats: {
      activities: parseInt(stats.activities_count),
      distance: parseFloat(stats.total_distance),
      duration: parseInt(stats.total_duration),
      followers: parseInt(followersCount.count),
      following: parseInt(followingCount.count)
    }
  });
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const user = await queryOne('SELECT id, username, display_name, bio, avatar, created_at FROM users WHERE id = $1', [req.params.id]);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const stats = await queryOne(`
    SELECT 
      COUNT(*) as activities_count,
      COALESCE(SUM(distance), 0) as total_distance,
      COALESCE(SUM(duration), 0) as total_duration
    FROM activities WHERE user_id = $1
  `, [req.params.id]);

  const followersCount = await queryOne('SELECT COUNT(*) as count FROM followers WHERE following_id = $1', [req.params.id]);
  const followingCount = await queryOne('SELECT COUNT(*) as count FROM followers WHERE follower_id = $1', [req.params.id]);
  const isFollowing = await queryOne('SELECT id FROM followers WHERE follower_id = $1 AND following_id = $2', [req.userId, req.params.id]);

  res.json({
    ...user,
    stats: {
      activities: parseInt(stats.activities_count),
      distance: parseFloat(stats.total_distance),
      duration: parseInt(stats.total_duration),
      followers: parseInt(followersCount.count),
      following: parseInt(followingCount.count)
    },
    isFollowing: !!isFollowing
  });
});

router.put('/me', authMiddleware, async (req: AuthRequest, res) => {
  const { displayName, bio, avatar } = req.body;

  await execute('UPDATE users SET display_name = $1, bio = $2, avatar = $3 WHERE id = $4',
    [displayName, bio, avatar, req.userId]);

  res.json({ success: true });
});

router.get('/search', authMiddleware, async (req: AuthRequest, res) => {
  const { q } = req.query;
  
  if (!q || typeof q !== 'string') {
    return res.json([]);
  }

  const users = await query(`
    SELECT id, username, display_name, avatar 
    FROM users 
    WHERE username ILIKE $1 OR display_name ILIKE $1
    LIMIT 20
  `, [`%${q}%`]);

  res.json(users);
});

export default router;
