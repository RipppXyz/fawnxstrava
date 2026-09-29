import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

export const query = async (text: string, params?: any[]) => {
  const result = await pool.query(text, params);
  return result.rows;
};

export const queryOne = async (text: string, params?: any[]) => {
  const result = await pool.query(text, params);
  return result.rows[0];
};

export const execute = async (text: string, params?: any[]) => {
  const result = await pool.query(text, params);
  return result;
};

// Initialize database schema
export const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      display_name TEXT,
      bio TEXT,
      avatar TEXT,
      created_at BIGINT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS activities (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      distance REAL NOT NULL,
      duration INTEGER NOT NULL,
      avg_speed REAL,
      max_speed REAL,
      elevation_gain REAL,
      elevation_loss REAL,
      started_at BIGINT NOT NULL,
      finished_at BIGINT NOT NULL,
      created_at BIGINT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS gps_points (
      id SERIAL PRIMARY KEY,
      activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      altitude REAL,
      accuracy REAL,
      speed REAL,
      timestamp BIGINT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS followers (
      id SERIAL PRIMARY KEY,
      follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at BIGINT NOT NULL,
      UNIQUE(follower_id, following_id)
    );

    CREATE TABLE IF NOT EXISTS activity_likes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
      created_at BIGINT NOT NULL,
      UNIQUE(user_id, activity_id)
    );

    CREATE TABLE IF NOT EXISTS activity_comments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at BIGINT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      icon TEXT,
      condition_type TEXT NOT NULL,
      condition_value REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_achievements (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
      unlocked_at BIGINT NOT NULL,
      UNIQUE(user_id, achievement_id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      related_id INTEGER,
      created_at BIGINT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      notifications_enabled INTEGER DEFAULT 1,
      location_tracking INTEGER DEFAULT 1,
      privacy_profile TEXT DEFAULT 'public',
      privacy_activities TEXT DEFAULT 'public',
      theme TEXT DEFAULT 'system'
    );

    CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);
    CREATE INDEX IF NOT EXISTS idx_gps_points_activity ON gps_points(activity_id);
    CREATE INDEX IF NOT EXISTS idx_followers_follower ON followers(follower_id);
    CREATE INDEX IF NOT EXISTS idx_followers_following ON followers(following_id);
    CREATE INDEX IF NOT EXISTS idx_activity_likes_activity ON activity_likes(activity_id);
    CREATE INDEX IF NOT EXISTS idx_activity_comments_activity ON activity_comments(activity_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
  `);

  // Insert achievements
  const achievements = [
    { name: 'First Steps', description: 'Complete your first activity', icon: '🎯', type: 'activities_count', value: 1 },
    { name: 'Getting Started', description: 'Complete 5 activities', icon: '🏃', type: 'activities_count', value: 5 },
    { name: 'Consistent', description: 'Complete 10 activities', icon: '💪', type: 'activities_count', value: 10 },
    { name: 'Dedicated', description: 'Complete 25 activities', icon: '🔥', type: 'activities_count', value: 25 },
    { name: '5K Club', description: 'Complete 5km in one activity', icon: '🎖️', type: 'single_distance', value: 5000 },
    { name: '10K Club', description: 'Complete 10km in one activity', icon: '🏅', type: 'single_distance', value: 10000 },
    { name: 'Half Marathon', description: 'Complete 21km in one activity', icon: '🥈', type: 'single_distance', value: 21000 },
    { name: 'Marathon', description: 'Complete 42km in one activity', icon: '🥇', type: 'single_distance', value: 42000 },
    { name: 'Century', description: 'Total 100km across all activities', icon: '💯', type: 'total_distance', value: 100000 },
    { name: 'Speed Demon', description: 'Reach 30 km/h speed', icon: '⚡', type: 'max_speed', value: 30 }
  ];

  for (const a of achievements) {
    await pool.query(
      'INSERT INTO achievements (name, description, icon, condition_type, condition_value) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (name) DO NOTHING',
      [a.name, a.description, a.icon, a.type, a.value]
    );
  }
};

export default { query, queryOne, execute, initDB };
