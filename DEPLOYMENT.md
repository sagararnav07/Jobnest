# JobNest Deployment Guide

This guide covers deploying the JobNest application (MERN stack) to production.

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier available)
- Git repository (GitHub, GitLab, etc.)

---

## Option 1: Deploy to Render (Recommended - Free Tier Available)

### Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. Create a free cluster
3. Create a database user with password
4. Add `0.0.0.0/0` to IP Access List (allows all IPs)
5. Get your connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/Jobnest`

### Step 2: Deploy Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `jobnest-backend`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=5001
   MONGODB_URL=<your-mongodb-atlas-url>
   JWT_SECRET=<generate-a-strong-secret>
   FRONTEND_URL=<your-frontend-url-after-deployment>
   ```
6. Click **Create Web Service**

### Step 3: Deploy Frontend to Render (Static Site)

1. Click **New** → **Static Site**
2. Connect the same repository
3. Configure:
   - **Name**: `jobnest-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variable:
   ```
   VITE_API_URL=https://jobnest-backend.onrender.com/api/v1
   ```
5. Click **Create Static Site**

### Step 4: Update CORS

After both are deployed, update the backend's `FRONTEND_URL` environment variable with the actual frontend URL.

---

## Option 2: Deploy to Railway

### Backend Deployment

1. Go to [Railway](https://railway.app)
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repository and set root directory to `backend`
4. Add environment variables (same as Render)
5. Railway will auto-detect Node.js and deploy

### Frontend Deployment

1. Create another service in the same project
2. Set root directory to `frontend`
3. Add build command: `npm run build`
4. Add environment variable: `VITE_API_URL`

---

## Option 3: Deploy to Vercel (Frontend) + Railway (Backend)

### Frontend on Vercel

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
4. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api/v1
   ```
5. Deploy

### Backend on Railway

Follow the Railway backend steps above.

---

## Option 4: Docker Deployment

Use the provided Docker files for containerized deployment.

### Build and Run Locally

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build
```

### Deploy to Cloud (AWS, GCP, Azure, DigitalOcean)

1. Push your code to the cloud provider's container registry
2. Use their container orchestration service (ECS, Cloud Run, ACI, App Platform)

---

## Environment Variables Reference

### Backend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 5001) | No |
| `NODE_ENV` | Environment (production/development) | Yes |
| `MONGODB_URL` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret for JWT tokens | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |
| `EMAIL_USER` | Email for sending OTPs | No |
| `EMAIL_PASS` | Email app password | No |

### Frontend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes |
| `VITE_SOCKET_URL` | WebSocket URL | No |

---

## Post-Deployment Checklist

- [ ] MongoDB Atlas is connected and accessible
- [ ] Backend health check works: `GET /api/v1/user`
- [ ] Frontend loads correctly
- [ ] User registration and login work
- [ ] File uploads work (resumes)
- [ ] Real-time messaging works (Socket.io)
- [ ] Email notifications work (if configured)

---

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` in backend matches your deployed frontend URL exactly
- Check the allowed origins in `backend/app.js`

### MongoDB Connection Issues
- Verify the connection string format
- Check IP whitelist in MongoDB Atlas (use `0.0.0.0/0` for any IP)
- Ensure database user has correct permissions

### Build Failures
- Check Node.js version compatibility (use 18+)
- Ensure all dependencies are in `package.json`
- Check build logs for specific errors

### Socket.io Not Working
- Ensure WebSocket connections are allowed by your hosting provider
- Some platforms require additional configuration for WebSockets
