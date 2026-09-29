# FawnXStrava - Quick Deploy Guide

## ⚡ Super Cepat (3 menit):

### Option 1: Pakai Script (Otomatis)
```bash
cd /workspaces/kereta/fawnxstrava
./deploy.sh
```

### Option 2: Manual (Copy-paste)

**Step 1 - Push ke GitHub:**
```bash
cd /workspaces/kereta/fawnxstrava

# Login GitHub (kalau belum)
gh auth login

# Create repo & push
gh repo create fawnxstrava --public --source=. --remote=origin --push
```

**Step 2 - Deploy Vercel:**

Buka: https://vercel.com/new

1. Import `RipppXyz/fawnxstrava`
2. Framework: **Vite**
3. Klik **Add Database** → **Postgres**
4. Environment Variables akan auto-terisi `POSTGRES_URL`
5. Tambah manual:
   ```
   JWT_SECRET=buatlah-random-32-karakter-atau-lebih-panjang-ya
   NODE_ENV=production
   ```
6. **Deploy**

Selesai! ✨

---

## 📝 Kalau Error:

**"gh repo create failed":**
```bash
# Login ulang dengan scope lebih lengkap
gh auth login --scopes repo,read:org
```

**"Vercel build failed":**
- Pastikan `POSTGRES_URL` sudah diisi
- Pastikan `JWT_SECRET` minimal 32 karakter

**Database schema tidak jalan:**
Database auto-init pas pertama kali app start. Tunggu beberapa detik.

---

## 🎯 Yang Sudah Siap:
✅ PostgreSQL migration complete
✅ All code tested & built
✅ 4 commits ready
✅ vercel.json configured
✅ Environment variables documented

Lokasi: `/workspaces/kereta/fawnxstrava/`
