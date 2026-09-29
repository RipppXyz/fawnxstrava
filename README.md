# FawnXStrava

A production-quality activity and journey tracking web application built with React, TypeScript, Express, and SQLite.

## Features

- **Activity Tracking**: Real-time GPS tracking with route recording
- **Analytics**: Detailed statistics with distance, pace, elevation, and trends
- **Social Features**: Follow users, like activities, and comment
- **Achievements**: Unlock achievements based on your activities
- **Responsive Design**: Works seamlessly on mobile and desktop
- **Clean UI**: Apple-inspired minimal design with dark mode support

## Tech Stack

### Frontend
- React 19 with TypeScript
- React Router for navigation
- Leaflet for maps (provider-agnostic architecture)
- CSS with custom properties for theming

### Backend
- Express with TypeScript
- Better SQLite3 for database
- JWT authentication
- Bcrypt for password hashing

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env and set your JWT_SECRET
```

### Development

Run both frontend and backend:
```bash
npm run dev
```

Or run separately:
```bash
# Backend only
npm run dev:server

# Frontend only
npm run dev:client
```

Frontend: http://localhost:5173
Backend: http://localhost:3000

### Production

Build:
```bash
npm run build
```

Type check:
```bash
npm run typecheck
```

## Project Structure

```
fawnxstrava/
├── server/
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── db.ts           # Database setup
│   └── index.ts        # Server entry
├── src/
│   ├── pages/          # React pages
│   ├── components/     # React components
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom hooks
│   ├── lib/            # API client
│   └── index.css       # Global styles
└── dist/               # Build output
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login

### Users
- `GET /api/users/me` - Get current user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/me` - Update profile
- `GET /api/users/search?q=` - Search users

### Activities
- `POST /api/activities` - Create activity
- `GET /api/activities` - List activities
- `GET /api/activities/:id` - Get activity
- `DELETE /api/activities/:id` - Delete activity
- `GET /api/activities/feed` - Social feed

### Social
- `POST /api/social/follow/:id` - Follow user
- `DELETE /api/social/follow/:id` - Unfollow
- `GET /api/social/followers/:id` - Get followers
- `GET /api/social/following/:id` - Get following
- `POST /api/social/like/:activityId` - Like activity
- `DELETE /api/social/like/:activityId` - Unlike
- `POST /api/social/comment/:activityId` - Comment
- `GET /api/social/comments/:activityId` - Get comments

### Achievements
- `GET /api/achievements` - List achievements
- `GET /api/achievements/:userId` - User achievements

### Notifications
- `GET /api/notifications` - List notifications
- `PUT /api/notifications/:id/read` - Mark read
- `PUT /api/notifications/read-all` - Mark all read

### Stats
- `GET /api/stats/dashboard` - Dashboard stats
- `GET /api/stats/trends?period=week|month` - Trends

### Settings
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings

## Features Implementation

### GPS Tracking
- Geolocation API with permission handling
- Real-time position updates
- Distance calculation using Haversine formula
- Route recording with GPS points

### Map Provider Abstraction
The map implementation uses a provider pattern:
- MapView component wraps the map library
- Currently uses Leaflet with OpenStreetMap
- Can be swapped for Google Maps, Mapbox, etc.

### Location Provider Abstraction
The useLocation hook abstracts GPS:
- Browser Geolocation API by default
- Can be extended for other sources
- Handles permissions and errors

### Authentication
- JWT tokens with 30-day expiration
- Bcrypt password hashing (10 rounds)
- Protected routes on frontend
- Auth middleware on backend

### Database
- SQLite with Better SQLite3 (synchronous)
- Indexed foreign keys
- Cascade deletes
- Achievement system with conditions

### Security
- Input validation
- SQL injection protection (prepared statements)
- Password hashing
- JWT secret from environment
- CORS enabled
- Authorization checks

### Accessibility
- Semantic HTML
- Keyboard navigation support
- Focus states
- ARIA labels on icons
- Reduced motion support
- Sufficient contrast

### Responsive Design
- Mobile-first approach
- Breakpoint at 768px
- Touch-friendly targets
- Responsive navigation
- Flexible grids

## Environment Variables

- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - Secret for JWT signing (required)
- `NODE_ENV` - Environment (development/production)

## License

MIT
