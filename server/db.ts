import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const db = new Database(join(__dirname, '../fawnxstrava.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    display_name TEXT,
    bio TEXT,
    avatar TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    distance REAL NOT NULL,
    duration INTEGER NOT NULL,
    avg_speed REAL,
    max_speed REAL,
    elevation_gain REAL,
    elevation_loss REAL,
    started_at INTEGER NOT NULL,
    finished_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS gps_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_id INTEGER NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    altitude REAL,
    accuracy REAL,
    speed REAL,
    timestamp INTEGER NOT NULL,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS followers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    follower_id INTEGER NOT NULL,
    following_id INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    UNIQUE(follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS activity_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    activity_id INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    UNIQUE(user_id, activity_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS activity_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    activity_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    condition_type TEXT NOT NULL,
    condition_value REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    achievement_id INTEGER NOT NULL,
    unlocked_at INTEGER NOT NULL,
    UNIQUE(user_id, achievement_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    related_id INTEGER,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    notifications_enabled INTEGER DEFAULT 1,
    location_tracking INTEGER DEFAULT 1,
    privacy_profile TEXT DEFAULT 'public',
    privacy_activities TEXT DEFAULT 'public',
    theme TEXT DEFAULT 'system',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);
  CREATE INDEX IF NOT EXISTS idx_gps_points_activity ON gps_points(activity_id);
  CREATE INDEX IF NOT EXISTS idx_followers_follower ON followers(follower_id);
  CREATE INDEX IF NOT EXISTS idx_followers_following ON followers(following_id);
  CREATE INDEX IF NOT EXISTS idx_activity_likes_activity ON activity_likes(activity_id);
  CREATE INDEX IF NOT EXISTS idx_activity_comments_activity ON activity_comments(activity_id);
  CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
`);

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

const insert = db.prepare('INSERT OR IGNORE INTO achievements (name, description, icon, condition_type, condition_value) VALUES (?, ?, ?, ?, ?)');
for (const a of achievements) {
  insert.run(a.name, a.description, a.icon, a.type, a.value);
}

export default db;
