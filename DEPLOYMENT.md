# Deployment Instructions

## Deploy ke Vercel

### Option 1: Via Vercel Dashboard (Recommended)

1. **Push ke GitHub dulu (manual)**:
   ```bash
   # Buat repo baru di GitHub: https://github.com/new
   # Nama: fawnxstrava
   
   # Lalu push:
   git remote add origin https://github.com/YOUR_USERNAME/fawnxstrava.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy di Vercel**:
   - Buka https://vercel.com/new
   - Import repository: `YOUR_USERNAME/fawnxstrava`
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables** di Vercel Dashboard:
   ```
   JWT_SECRET=your-random-secret-key-change-this
   NODE_ENV=production
   ```

4. **Deploy!**

### Option 2: Via Vercel CLI

```bash
# Login
npx vercel login

# Deploy
npx vercel

# Production deploy
npx vercel --prod
```

## Important Notes

### Database
⚠️ **SQLite tidak ideal untuk Vercel** karena Vercel serverless, file database hilang setiap deploy.

**Solusi Production**:
1. Ganti ke **PostgreSQL** (Vercel Postgres/Neon/Supabase)
2. Atau **PlanetScale** (MySQL)
3. Update `server/db.ts` untuk koneksi remote database

### API Routes
Vercel akan route:
- `/api/*` → Backend (server/index.ts)
- `/*` → Frontend (dist/)

### Missing Features untuk Production
- Database migration system
- Production-ready database (PostgreSQL/MySQL)
- File upload untuk avatar (S3/Cloudinary)
- Email notifications
- Rate limiting
- Logging system

## Quick Deploy (Current State)

File sudah siap di folder:
```
/workspaces/kereta/fawnxstrava/
```

Commit sudah dibuat, tinggal push:
```bash
cd /workspaces/kereta/fawnxstrava
git remote add origin https://github.com/YOUR_USERNAME/fawnxstrava.git
git push -u origin main
```

Lalu import ke Vercel dari dashboard.
