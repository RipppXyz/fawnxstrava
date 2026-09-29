import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { db } from '../db.js';

const router = Router();

router.post('/', authMiddleware, (req: AuthRequest, res) => {
  const { type, name, distance, duration, avgSpeed, maxSpeed, elevationGain, elevationLoss, startedAt, finishedAt, gpsPoints } = req.body;

  if (!type || !name || distance === undefined || !duration || !startedAt || !finishedAt) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const now = Date.now();
  
  const result = db.prepare(`
    INSERT INTO activities (user_id, type, name, distance, duration, avg_speed, max_speed, elevation_gain, elevation_loss, started_at, finished_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.userId, type, name, distance, duration, avgSpeed, maxSpeed, elevationGain, elevationLoss, startedAt, finishedAt, now);

  const activityId = result.lastInsertRowid as number;

  if (gpsPoints && Array.isArray(gpsPoints)) {
    const insertPoint = db.prepare('INSERT INTO gps_points (activity_id, latitude, longitude, altitude, accuracy, speed, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const point of gpsPoints) {
      insertPoint.run(activityId, point.latitude, point.longitude, point.altitude, point.accuracy, point.speed, point.timestamp);
    }
  }

  checkAchievements(req.userId as number, activityId, distance, maxSpeed);

  res.json({ id: activityId, success: true });
});

router.get('/', authMiddleware, (req: AuthRequest, res) => {
  const { type, sort = 'date', limit = 50 } = req.query;
  
  let query = 'SELECT * FROM activities WHERE user_id = ?';
  const params: any[] = [req.userId];

  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }

  query += sort === 'distance' ? ' ORDER BY distance DESC' : ' ORDER BY started_at DESC';
  query += ' LIMIT ?';
  params.push(Number(limit));

  const activities = db.prepare(query).all(...params);
  res.json(activities);
});

router.get('/feed', authMiddleware, (req: AuthRequest, res) => {
  const activities = db.prepare(`
    SELECT a.*, u.username, u.display_name, u.avatar,
      (SELECT COUNT(*) FROM activity_likes WHERE activity_id = a.id) as likes_count,
      (SELECT COUNT(*) FROM activity_comments WHERE activity_id = a.id) as comments_count,
      (SELECT id FROM activity_likes WHERE activity_id = a.id AND user_id = ?) as user_liked
    FROM activities a
    JOIN users u ON a.user_id = u.id
    WHERE a.user_id IN (SELECT following_id FROM followers WHERE follower_id = ?)
       OR a.user_id = ?
    ORDER BY a.started_at DESC
    LIMIT 50
  `).all(req.userId, req.userId, req.userId);

  res.json(activities);
});

router.get('/:id', authMiddleware, (req: AuthRequest, res) => {
  const activity = db.prepare(`
    SELECT a.*, u.username, u.display_name, u.avatar,
      (SELECT COUNT(*) FROM activity_likes WHERE activity_id = a.id) as likes_count,
      (SELECT COUNT(*) FROM activity_comments WHERE activity_id = a.id) as comments_count,
      (SELECT id FROM activity_likes WHERE activity_id = a.id AND user_id = ?) as user_liked
    FROM activities a
    JOIN users u ON a.user_id = u.id
    WHERE a.id = ?
  `).get(req.userId, req.params.id) as any;

  if (!activity) {
    return res.status(404).json({ error: 'Activity not found' });
  }

  const gpsPoints = db.prepare('SELECT * FROM gps_points WHERE activity_id = ? ORDER BY timestamp').all(req.params.id);
  
  res.json({ ...activity, gpsPoints });
});

router.delete('/:id', authMiddleware, (req: AuthRequest, res) => {
  const activity = db.prepare('SELECT user_id FROM activities WHERE id = ?').get(req.params.id) as any;
  
  if (!activity) {
    return res.status(404).json({ error: 'Activity not found' });
  }

  if (activity.user_id !== req.userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  db.prepare('DELETE FROM activities WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

function checkAchievements(userId: number, _activityId: number, distance: number, maxSpeed: number) {
  const activitiesCount = db.prepare('SELECT COUNT(*) as count FROM activities WHERE user_id = ?').get(userId) as any;
  const totalDistance = db.prepare('SELECT SUM(distance) as total FROM activities WHERE user_id = ?').get(userId) as any;

  const achievements = db.prepare('SELECT * FROM achievements').all() as any[];
  
  for (const achievement of achievements) {
    const alreadyUnlocked = db.prepare('SELECT id FROM user_achievements WHERE user_id = ? AND achievement_id = ?').get(userId, achievement.id);
    if (alreadyUnlocked) continue;

    let unlock = false;

    if (achievement.condition_type === 'activities_count' && activitiesCount.count >= achievement.condition_value) {
      unlock = true;
    } else if (achievement.condition_type === 'single_distance' && distance >= achievement.condition_value) {
      unlock = true;
    } else if (achievement.condition_type === 'total_distance' && totalDistance.total >= achievement.condition_value) {
      unlock = true;
    } else if (achievement.condition_type === 'max_speed' && maxSpeed >= achievement.condition_value) {
      unlock = true;
    }

    if (unlock) {
      db.prepare('INSERT INTO user_achievements (user_id, achievement_id, unlocked_at) VALUES (?, ?, ?)').run(userId, achievement.id, Date.now());
      db.prepare('INSERT INTO notifications (user_id, type, title, message, created_at) VALUES (?, ?, ?, ?, ?)').run(
        userId, 'achievement', 'Achievement Unlocked!', `You unlocked: ${achievement.name}`, Date.now()
      );
    }
  }
}

export default router;
