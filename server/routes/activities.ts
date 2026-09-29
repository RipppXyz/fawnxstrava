import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { query, queryOne, execute } from '../db.js';

const router = Router();

router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const { type, name, distance, duration, avgSpeed, maxSpeed, elevationGain, elevationLoss, startedAt, finishedAt, gpsPoints } = req.body;

  if (!type || !name || distance === undefined || !duration || !startedAt || !finishedAt) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const now = Date.now();
  
  const result = await execute(`
    INSERT INTO activities (user_id, type, name, distance, duration, avg_speed, max_speed, elevation_gain, elevation_loss, started_at, finished_at, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id
  `, [req.userId, type, name, distance, duration, avgSpeed, maxSpeed, elevationGain, elevationLoss, startedAt, finishedAt, now]);

  const activityId = result.rows[0].id;

  if (gpsPoints && Array.isArray(gpsPoints)) {
    for (const point of gpsPoints) {
      await execute('INSERT INTO gps_points (activity_id, latitude, longitude, altitude, accuracy, speed, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7)', 
        [activityId, point.latitude, point.longitude, point.altitude, point.accuracy, point.speed, point.timestamp]);
    }
  }

  await checkAchievements(req.userId as number, activityId, distance, maxSpeed);

  res.json({ id: activityId, success: true });
});

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const { type, sort = 'date', limit = 50 } = req.query;
  
  let sql = 'SELECT * FROM activities WHERE user_id = $1';
  const params: any[] = [req.userId];

  if (type) {
    sql += ' AND type = $2';
    params.push(type);
  }

  sql += sort === 'distance' ? ' ORDER BY distance DESC' : ' ORDER BY started_at DESC';
  sql += ` LIMIT $${params.length + 1}`;
  params.push(Number(limit));

  const activities = await query(sql, params);
  res.json(activities);
});

router.get('/feed', authMiddleware, async (req: AuthRequest, res) => {
  const activities = await query(`
    SELECT a.*, u.username, u.display_name, u.avatar,
      (SELECT COUNT(*) FROM activity_likes WHERE activity_id = a.id) as likes_count,
      (SELECT COUNT(*) FROM activity_comments WHERE activity_id = a.id) as comments_count,
      (SELECT id FROM activity_likes WHERE activity_id = a.id AND user_id = $1) as user_liked
    FROM activities a
    JOIN users u ON a.user_id = u.id
    WHERE a.user_id IN (SELECT following_id FROM followers WHERE follower_id = $2)
       OR a.user_id = $3
    ORDER BY a.started_at DESC
    LIMIT 50
  `, [req.userId, req.userId, req.userId]);

  res.json(activities);
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const activity = await queryOne(`
    SELECT a.*, u.username, u.display_name, u.avatar,
      (SELECT COUNT(*) FROM activity_likes WHERE activity_id = a.id) as likes_count,
      (SELECT COUNT(*) FROM activity_comments WHERE activity_id = a.id) as comments_count,
      (SELECT id FROM activity_likes WHERE activity_id = a.id AND user_id = $1) as user_liked
    FROM activities a
    JOIN users u ON a.user_id = u.id
    WHERE a.id = $2
  `, [req.userId, req.params.id]) as any;

  if (!activity) {
    return res.status(404).json({ error: 'Activity not found' });
  }

  const gpsPoints = await query('SELECT * FROM gps_points WHERE activity_id = $1 ORDER BY timestamp', [req.params.id]);
  
  res.json({ ...activity, gpsPoints });
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const activity = await queryOne('SELECT user_id FROM activities WHERE id = $1', [req.params.id]) as any;
  
  if (!activity) {
    return res.status(404).json({ error: 'Activity not found' });
  }

  if (activity.user_id !== req.userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  await execute('DELETE FROM activities WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});

async function checkAchievements(userId: number, _activityId: number, distance: number, maxSpeed: number) {
  const activitiesCount = await queryOne('SELECT COUNT(*) as count FROM activities WHERE user_id = $1', [userId]) as any;
  const totalDistance = await queryOne('SELECT SUM(distance) as total FROM activities WHERE user_id = $1', [userId]) as any;

  const achievements = await query('SELECT * FROM achievements', []) as any[];
  
  for (const achievement of achievements) {
    const alreadyUnlocked = await queryOne('SELECT id FROM user_achievements WHERE user_id = $1 AND achievement_id = $2', [userId, achievement.id]);
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
      await execute('INSERT INTO user_achievements (user_id, achievement_id, unlocked_at) VALUES ($1, $2, $3)', [userId, achievement.id, Date.now()]);
      await execute('INSERT INTO notifications (user_id, type, title, message, created_at) VALUES ($1, $2, $3, $4, $5)', [
        userId, 'achievement', 'Achievement Unlocked!', `You unlocked: ${achievement.name}`, Date.now()
      ]);
    }
  }
}

export default router;
