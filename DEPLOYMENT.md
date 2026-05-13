# Smart Voyage Optimizer - Deployment Guide

## Architecture Overview

```
Frontend (Vercel)          Backend (Railway)          Supabase
┌─────────────────┐       ┌──────────────────┐       ┌──────────────┐
│  React + Vite    │──────▶│  Express + TS     │──────▶│  PostgreSQL  │
│  Nginx (Docker)  │       │  Socket.IO        │       │  Auth        │
│  Dark Mode       │       │  Route Optimizer  │       │  Row Level   │
│  PWA-ready       │       │  Weather Engine   │       │  Security    │
└─────────────────┘       └──────────────────┘       └──────────────┘
        │                          │
        └──────────────────────────┘
              WebSocket (realtime)
```

## Prerequisites

- Node.js 22+
- Docker & Docker Compose
- Supabase account (free tier works)
- Google Cloud Console account (for OAuth)
- Railway account (or any Docker host)
- Vercel account

---

## 1. Supabase Setup

### 1.1 Create Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a region close to your users (e.g., `us-east-1` or `eu-west-1`)
3. Note your project URL and API keys from **Settings > API**

### 1.2 Configure Authentication
1. Go to **Authentication > Providers**
2. Enable **Email/Password** (default is on)
3. Enable **Google**:
   - Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com)
   - Set authorized redirect URI to: `https://[YOUR_PROJECT].supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret into Supabase

### 1.3 Run Database Migrations
1. Go to **SQL Editor** in Supabase dashboard
2. Copy and paste the contents of `backend/src/db/migrations/001_initial_schema.sql`
3. Run the migration
4. Verify tables created: `user_profiles`, `saved_routes`, `voyage_history`, `user_preferences`

### 1.4 Environment Variables
```
SUPABASE_URL=https://[YOUR_PROJECT].supabase.co
SUPABASE_ANON_KEY=[anon key from Settings > API]
SUPABASE_SERVICE_ROLE_KEY=[service_role key - NEVER expose to frontend]
```

---

## 2. Frontend Deployment (Vercel)

### 2.1 Build Configuration
Ensure `.env.production` contains:
```
VITE_SUPABASE_URL=https://[YOUR_PROJECT].supabase.co
VITE_SUPABASE_ANON_KEY=[your anon key]
VITE_API_URL=https://[your-backend-domain]
VITE_WS_URL=https://[your-backend-domain]
VITE_DEMO_MODE=false
```

### 2.2 Vercel Setup
1. Connect your GitHub repository to Vercel
2. Set **Framework Preset** to `Vite`
3. Set **Root Directory** to `frontend`
4. Add environment variables (from above)
5. Deploy

### 2.3 SPA Routing
Vercel handles SPA routing automatically. No `vercel.json` needed.

### 2.4 Custom Domain (Optional)
1. Go to **Vercel > Project > Domains**
2. Add your domain (e.g., `app.smartvoyage.com`)
3. Update DNS records as instructed

---

## 3. Backend Deployment (Railway)

### 3.1 Dockerfile
The backend Dockerfile at `backend/Dockerfile` uses multi-stage builds:
- Stage 1: Compile TypeScript with `node:22-alpine`
- Stage 2: Production runtime with only `dist/`, `node_modules/`, `package.json`
- Runs as non-root `node` user
- Includes health check at `/api/health`

### 3.2 Railway Setup
1. Create a new project on [Railway](https://railway.app)
2. Deploy from GitHub (select `backend/` as root directory)
3. Or use Docker directly:
   ```bash
   docker build -t smart-voyage-backend ./backend
   docker tag smart-voyage-backend registry.railway.app/your-project/backend
   docker push registry.railway.app/your-project/backend
   ```

### 3.3 Environment Variables (Railway)
```
PORT=4000
SUPABASE_URL=https://[YOUR_PROJECT].supabase.co
SUPABASE_ANON_KEY=[anon key]
SUPABASE_SERVICE_ROLE_KEY=[service_role key]
OPENWEATHER_API_KEY=[your key]
MAPTILER_API_KEY=[your key]
CORS_ORIGIN=https://[your-frontend-domain]
```

### 3.4 Health Check
Railway can use the Docker health check or a custom endpoint:
```bash
curl https://[your-backend-domain]/api/health
# Returns: { "status": "ok", "uptime": 123, "timestamp": "...", "version": "1.0.0" }
```

### 3.5 WebSocket Support
Railway supports WebSockets natively. Ensure:
- No additional proxy configuration needed
- `CORS_ORIGIN` matches your frontend domain exactly
- Socket.IO uses WebSocket transport (default)

---

## 4. Production Docker Compose (Self-Hosted)

For self-hosted deployment (VPS, DigitalOcean, etc.):

```bash
# Build and start
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop
docker-compose -f docker-compose.prod.yml down
```

### Requirements
- Docker & Docker Compose installed
- DNS pointing to your server
- Reverse proxy (Caddy, Nginx, Traefik) for SSL termination

### Environment File
Create `.env.production`:
```bash
OPENWEATHER_API_KEY=...
MAPTILER_API_KEY=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
CORS_ORIGIN=https://your-frontend-domain.com
```

---

## 5. Environment Variables Reference

### Backend
| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 4000) | No |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `OPENWEATHER_API_KEY` | OpenWeather API key | Yes |
| `MAPTILER_API_KEY` | MapTiler API key | Yes |
| `CORS_ORIGIN` | Allowed CORS origin | No |

### Frontend (Vite)
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | Yes |
| `VITE_API_URL` | Backend API URL | Yes |
| `VITE_WS_URL` | Backend WebSocket URL | Yes |
| `VITE_DEMO_MODE` | Enable demo mode | No |

---

## 6. Domain Configuration

### DNS Setup
```
Frontend:  app.smartvoyage.com → CNAME → cname.vercel-dns.com
Backend:   api.smartvoyage.com → CNAME → [railway-domain]
```

### CORS Configuration
Set `CORS_ORIGIN` to your exact frontend domain:
```
CORS_ORIGIN=https://app.smartvoyage.com
```

---

## 7. Scaling Considerations

### Backend Scaling
- **Min instances**: 1 (to avoid cold starts; Railway auto-scales from 0)
- **Max instances**: 2-3 for most use cases
- **Memory**: 512MB-1GB recommended
- **CPU**: 1-2 vCPUs

### Database
- Supabase free tier: 500MB database, 50,000 monthly active users
- Upgrade to Pro ($25/month) for larger workloads: 8GB database, 100,000 monthly active users

### WebSocket Connections
- Railway supports up to 10,000 concurrent WebSocket connections per instance
- Each connection uses approximately 10-20KB of memory
- For high-traffic scenarios, consider horizontal scaling with Redis adapter for Socket.IO

---

## 8. Google OAuth Configuration

### Step 1: Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Name: `Smart Voyage`
7. **Authorized JavaScript origins**: `https://app.smartvoyage.com`
8. **Authorized redirect URIs**: `https://[YOUR_PROJECT].supabase.co/auth/v1/callback`

### Step 2: Supabase
1. Go to **Authentication > Providers > Google**
2. Enable Google provider
3. Paste Client ID and Client Secret
4. Save

---

## 9. Production Checklist

- [ ] Supabase project created and migrated
- [ ] Google OAuth configured
- [ ] Frontend environment variables set
- [ ] Backend environment variables set
- [ ] CORS_ORIGIN properly configured
- [ ] Docker images building successfully
- [ ] Health checks passing
- [ ] WebSocket connections working
- [ ] HTTPS enabled (via Vercel/Railway)
- [ ] Session persistence verified
- [ ] Route optimization functional
- [ ] Saved routes persisting
- [ ] Voyage history recording

---

## 10. Troubleshooting

### WebSocket Connection Issues
- Verify `CORS_ORIGIN` matches frontend domain exactly
- Check browser console for CORS errors
- Ensure Railway allows WebSocket connections (default: yes)
- Verify `VITE_WS_URL` in frontend env

### Authentication Issues
- Check Supabase URL and anon key are correct
- Verify Google OAuth redirect URIs match exactly
- Check browser console for auth errors
- Ensure `VITE_SUPABASE_URL` ends without trailing slash

### Build Failures
- Run `npm run build` locally first to verify
- Check TypeScript errors with `npx tsc --noEmit`
- Verify all environment variables are present
- Clear Docker build cache: `docker builder prune`

### Docker Issues
```bash
# Test backend build
cd backend && docker build -t test-backend .

# Test frontend build
cd frontend && docker build -t test-frontend .

# Run with production compose
docker-compose -f docker-compose.prod.yml up -d
```

### Database Issues
- Run SQL migration again via Supabase SQL Editor
- Check Row Level Security policies are enabled
- Verify API keys have proper permissions

---

## 11. Quick Deploy Commands

```bash
# 1. Build backend Docker image
docker build -t smart-voyage-backend ./backend

# 2. Build frontend Docker image
docker build -t smart-voyage-frontend ./frontend

# 3. Deploy backend to Railway (via CLI)
railway login
railway init
railway up

# 4. Deploy frontend to Vercel (via CLI)
vercel login
vercel --prod

# 5. Or run locally with production config
docker-compose -f docker-compose.prod.yml up --build
```
