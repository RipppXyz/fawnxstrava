import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { query, queryOne, execute } from '../db.js';

const router = Router();

router.post('/follow/:id', authMiddleware, async (req: AuthRequest, res) => {
  const targetId = Number(req.params.id);
  
  if (targetId === req.userId) {
    return res.status(400).json({ error: 'Cannot follow yourself' });
  }

  try {
    await execute('INSERT INTO followers (follower_id, following_id, created_at) VALUES ($1, $2, $3)', [req.userId, targetId, Date.now()]);
    
    await execute('INSERT INTO notifications (user_id, type, title, message, related_id, created_at) VALUES ($1, $2, $3, $4, $5, $6)', [
      targetId, 'follow', 'New Follower', 'Someone started following you', req.userId, Date.now()
    ]);

    res.json({ success: true });
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Already following' });
    }
    throw err;
  }
});

router.delete('/follow/:id', authMiddleware, async (req: AuthRequest, res) => {
  await execute('DELETE FROM followers WHERE follower_id = $1 AND following_id = $2', [req.userId, req.params.id]);
  res.json({ success: true });
});

router.get('/followers/:id', authMiddleware, async (req: AuthRequest, res) => {
  const followers = await query(`
    SELECT u.id, u.username, u.display_name, u.avatar
    FROM followers f
    JOIN users u ON f.follower_id = u.id
    WHERE f.following_id = $1
    ORDER BY f.created_at DESC
  `, [req.params.id]);

  res.json(followers);
});

router.get('/following/:id', authMiddleware, async (req: AuthRequest, res) => {
  const following = await query(`
    SELECT u.id, u.username, u.display_name, u.avatar
    FROM followers f
    JOIN users u ON f.following_id = u.id
    WHERE f.follower_id = $1
    ORDER BY f.created_at DESC
  `, [req.params.id]);

  res.json(following);
});

router.post('/like/:activityId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    await execute('INSERT INTO activity_likes (user_id, activity_id, created_at) VALUES ($1, $2, $3)', [req.userId, req.params.activityId, Date.now()]);

    const activity = await queryOne('SELECT user_id FROM activities WHERE id = $1', [req.params.activityId]) as any;
    if (activity && activity.user_id !== req.userId) {
      await execute('INSERT INTO notifications (user_id, type, title, message, related_id, created_at) VALUES ($1, $2, $3, $4, $5, $6)', [
        activity.user_id, 'like', 'New Like', 'Someone liked your activity', req.params.activityId, Date.now()
      ]);
    }

    res.json({ success: true });
  } catch (err: any) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Already liked' });
    }
    throw err;
  }
});

router.delete('/like/:activityId', authMiddleware, async (req: AuthRequest, res) => {
  await execute('DELETE FROM activity_likes WHERE user_id = $1 AND activity_id = $2', [req.userId, req.params.activityId]);
  res.json({ success: true });
});

router.post('/comment/:activityId', authMiddleware, async (req: AuthRequest, res) => {
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: 'Comment cannot be empty' });
  }

  const result = await execute('INSERT INTO activity_comments (user_id, activity_id, content, created_at) VALUES ($1, $2, $3, $4) RETURNING id', [
    req.userId, req.params.activityId, content, Date.now()
  ]);

  const activity = await queryOne('SELECT user_id FROM activities WHERE id = $1', [req.params.activityId]) as any;
  if (activity && activity.user_id !== req.userId) {
    await execute('INSERT INTO notifications (user_id, type, title, message, related_id, created_at) VALUES ($1, $2, $3, $4, $5, $6)', [
      activity.user_id, 'comment', 'New Comment', 'Someone commented on your activity', req.params.activityId, Date.now()
    ]);
  }

  res.json({ id: result.rows[0].id, success: true });
});

router.get('/comments/:activityId', authMiddleware, async (req: AuthRequest, res) => {
  const comments = await query(`
    SELECT c.*, u.username, u.display_name, u.avatar
    FROM activity_comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.activity_id = $1
    ORDER BY c.created_at ASC
  `, [req.params.activityId]);

  res.json(comments);
});

export default router;
