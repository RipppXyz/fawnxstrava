# FawnXStrava

Activity tracking web app with GPS, social features, and achievements. Built with React, TypeScript, Express, and PostgreSQL.

## Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/fawnxstrava)

### Prerequisites
1. Vercel account
2. PostgreSQL database (Vercel Postgres, Neon, or Supabase)

### Steps
1. Click "Deploy" button above or visit [Vercel Dashboard](https://vercel.com/new)
2. Import this repository
3. Add environment variables:
   ```
   POSTGRES_URL=postgresql://user:pass@host:5432/dbname
   JWT_SECRET=your-random-secret-key-min-32-chars
   NODE_ENV=production
   ```
4. Deploy!

## Features
- ✅ GPS tracking with real-time location
- ✅ Activity recording with routes
- ✅ Social features (follow, like, comment)
- ✅ Achievements system
- ✅ Statistics and analytics
- ✅ Responsive design + dark mode
- ✅ Full authentication

## Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your PostgreSQL connection

# Run dev server
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:3000

## Tech Stack
- **Frontend**: React 19, TypeScript, Leaflet
- **Backend**: Express, PostgreSQL, JWT
- **Build**: Vite

## Database Setup

The app uses PostgreSQL. You can use:
- **Vercel Postgres** (recommended for Vercel deployment)
- **Neon** (serverless Postgres)
- **Supabase** (open source)
- Local PostgreSQL

Database tables are created automatically on first run.

## Environment Variables

Required:
- `POSTGRES_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens (min 32 chars)
- `NODE_ENV` - Environment (development/production)

## API Endpoints

- `/api/auth` - Authentication
- `/api/users` - User profiles
- `/api/activities` - Activity CRUD
- `/api/social` - Social features
- `/api/achievements` - Achievements
- `/api/notifications` - Notifications
- `/api/stats` - Statistics
- `/api/settings` - User settings

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## License
MIT
