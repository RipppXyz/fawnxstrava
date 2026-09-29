#!/bin/bash

echo "🚀 FawnXStrava Deployment Script"
echo "=================================="
echo ""

# Check if gh is authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ GitHub not authenticated. Please run: gh auth login"
    exit 1
fi

# Create GitHub repo
echo "📦 Creating GitHub repository..."
gh repo create fawnxstrava --public --description "FawnXStrava - Activity tracking app with GPS" --source=. --remote=origin

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "🎯 Next steps:"
echo "1. Go to: https://vercel.com/new"
echo "2. Import: $(gh repo view --json url -q .url)"
echo "3. Framework: Vite"
echo "4. Add Postgres database in Vercel Storage"
echo "5. Set env vars:"
echo "   - POSTGRES_URL (from Vercel Postgres)"
echo "   - JWT_SECRET (random 32+ chars)"
echo "   - NODE_ENV=production"
echo "6. Deploy!"
echo ""
echo "✨ Done! Your repo: $(gh repo view --json url -q .url)"
