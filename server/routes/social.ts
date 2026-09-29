import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { db } from '../db.js';

const router = Router();

router.post('/follow/:id', authMiddleware, (req: AuthRequest, res) => {
  const targetId = Number(req.params.id);
  
  if (targetId === req.userId) {
    return res.status(400).json({ error: 'Cannot follow yourself' });
  }

  try {
    db.prepare('INSERT INTO followers (follower_id, following_id, created_at) VALUES (?, ?, ?)').run(req.userId, targetId, Date.now());
    
    db.prepare('INSERT INTO notifications (user_id, type, title, message, related_id, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
      targetId, 'follow', 'New Follower', 'Someone started following you', req.userId, Date.now()
    );

    res.json({ success: true });
  } catch (err: any) {
    if (err.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ error: 'Already following' });
    }
    throw err;
  }
});

router.delete('/follow/:id', authMiddleware, (req: AuthRequest, res) => {
  db.prepare('DELETE FROM followers WHERE follower_id = ? AND following_id = ?').run(req.userId, req.params.id);
  res.json({ success: true });
});

router.get('/followers/:id', authMiddleware, (req: AuthRequest, res) => {
  const followers = db.prepare(`
    SELECT u.id, u.username, u.display_name, u.avatar
    FROM followers f
    JOIN users u ON f.follower_id = u.id
    WHERE f.following_id = ?
    ORDER BY f.created_at DESC
  `).all(req.params.id);

  res.json(followers);
});

router.get('/following/:id', authMiddleware, (req: AuthRequest, res) => {
  const following = db.prepare(`
    SELECT u.id, u.username, u.display_name, u.avatar
    FROM followers f
    JOIN users u ON f.following_id = u.id
    WHERE f.follower_id = ?
    ORDER BY f.created_at DESC
  `).all(req.params.id);

  res.json(following);
});

router.post('/like/:activityId', authMiddleware, (req: AuthRequest, res) => {
  try {
    db.prepare('INSERT INTO activity_likes (user_id, activity_id, created_at) VALUES (?, ?, ?)').run(req.userId, req.params.activityId, Date.now());

    const activity = db.prepare('SELECT user_id FROM activities WHERE id = ?').get(req.params.activityId) as any;
    if (activity && activity.user_id !== req.userId) {
      db.prepare('INSERT INTO notifications (user_id, type, title, message, related_id, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
        activity.user_id, 'like', 'New Like', 'Someone liked your activity', req.params.activityId, Date.now()
      );
    }

    res.json({ success: true });
  } catch (err: any) {
    if (err.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ error: 'Already liked' });
    }
    throw err;
  }
});

router.delete('/like/:activityId', authMiddleware, (req: AuthRequest, res) => {
  db.prepare('DELETE FROM activity_likes WHERE user_id = ? AND activity_id = ?').run(req.userId, req.params.activityId);
  res.json({ success: true });
});

router.post('/comment/:activityId', authMiddleware, (req: AuthRequest, res) => {
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: 'Comment cannot be empty' });
  }

  const result = db.prepare('INSERT INTO activity_comments (user_id, activity_id, content, created_at) VALUES (?, ?, ?, ?)').run(
    req.userId, req.params.activityId, content, Date.now()
  );

  const activity = db.prepare('SELECT user_id FROM activities WHERE id = ?').get(req.params.activityId) as any;
  if (activity && activity.user_id !== req.userId) {
    db.prepare('INSERT INTO notifications (user_id, type, title, message, related_id, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
      activity.user_id, 'comment', 'New Comment', 'Someone commented on your activity', req.params.activityId, Date.now()
    );
  }

  res.json({ id: result.lastInsertRowid, success: true });
});

router.get('/comments/:activityId', authMiddleware, (req: AuthRequest, res) => {
  const comments = db.prepare(`
    SELECT c.*, u.username, u.display_name, u.avatar
    FROM activity_comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.activity_id = ?
    ORDER BY c.created_at ASC
  `).all(req.params.activityId);

  res.json(comments);
});

export default router;
