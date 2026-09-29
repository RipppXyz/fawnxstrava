# GitHub Token Setup

## Option 1: Bikin Token Baru (kalau mau automated)

1. **Buka**: https://github.com/settings/tokens/new

2. **Settings**:
   - Token name: `FawnXStrava Deploy`
   - Expiration: `30 days`
   
3. **Permissions** (centang ini):
   - ✅ `repo` (full control)
   - ✅ `workflow`
   - ✅ `write:packages`
   - ✅ `delete:packages`

4. **Generate token** → Copy token

5. **Login ulang**:
   ```bash
   gh auth login
   # Pilih: "Paste an authentication token"
   # Paste token baru
   ```

6. **Test**:
   ```bash
   gh auth status
   gh repo create test-repo --public --confirm
   ```

## Option 2: Manual (Recommended - lebih cepat)

Gausah bikin token baru, langsung manual:

```bash
# 1. Buat repo di browser: https://github.com/new
#    Nama: fawnxstrava
#    Public

# 2. Push code
cd /workspaces/kereta/fawnxstrava
git remote add origin https://github.com/RipppXyz/fawnxstrava.git
git push -u origin main

# 3. Deploy: https://vercel.com/new
```

**Lebih simple, ga ribet!** 😎

---

## Troubleshooting

**"Permission denied"**: Token kamu ga ada scope `repo`

**"GraphQL error"**: Token limited, pakai manual push

**"Authentication failed"**: 
```bash
gh auth logout
gh auth login
```
