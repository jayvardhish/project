# SmartLearn Platform - Render Deployment Guide

## Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **MongoDB Atlas**: Ensure your MongoDB is accessible from external IPs
4. **API Keys**: Have all required API keys ready

## Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **Connect to Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Select the repository containing `render.yaml`
   - Render will automatically detect the configuration

3. **Set Environment Variables**
   
   For the **backend service**, set these in Render dashboard:
   - `MONGODB_URI`: Your MongoDB connection string
   - `MAIL_USERNAME`: Your email for sending notifications
   - `MAIL_PASSWORD`: Your email app password
   - `MAIL_FROM`: Same as MAIL_USERNAME
   - `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth secret
   - `GOOGLE_REDIRECT_URI`: `https://your-backend-url.onrender.com/api/auth/google/callback`
   - `DEEPSEEK_API_KEY`: Your DeepSeek/OpenRouter API key
   - `CLIENT_URL`: Your frontend URL (e.g., `https://your-frontend.onrender.com`)

   For the **frontend service**, set:
   - `VITE_API_URL`: Your backend URL (e.g., `https://your-backend.onrender.com`)

4. **Deploy**
   - Click "Apply" to deploy both services
   - Wait for builds to complete (5-10 minutes)

### Option 2: Manual Setup

#### Backend Setup

1. **Create Web Service**
   - New → Web Service
   - Connect your repository
   - Name: `smartlearn-backend`
   - Runtime: Python 3
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

2. **Add Environment Variables** (same as above)

#### Frontend Setup

1. **Create Static Site**
   - New → Static Site
   - Connect your repository
   - Name: `smartlearn-frontend`
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`

2. **Add Environment Variable**
   - `VITE_API_URL`: Your backend URL

## Post-Deployment Configuration

### Update CORS Settings

After deployment, update `backend/main.py` to include your production URLs:

```python
origins = [
    os.getenv("CLIENT_URL", "http://localhost:5173"),
    "https://your-frontend.onrender.com",  # Add your actual frontend URL
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

### Update Google OAuth Redirect

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to your OAuth credentials
3. Add authorized redirect URI: `https://your-backend.onrender.com/api/auth/google/callback`

### MongoDB Network Access

1. Go to MongoDB Atlas
2. Network Access → Add IP Address
3. Allow access from anywhere (0.0.0.0/0) or add Render's IP ranges

## Troubleshooting

### Backend Issues

**Service won't start:**
- Check logs in Render dashboard
- Verify all environment variables are set
- Ensure MongoDB connection string is correct

**Database connection fails:**
- Check MongoDB Atlas network access settings
- Verify connection string includes username/password
- Test connection string locally first

### Frontend Issues

**API calls fail:**
- Verify `VITE_API_URL` is set correctly
- Check CORS settings in backend
- Ensure backend service is running

**Build fails:**
- Check Node.js version compatibility
- Clear build cache and retry
- Verify all dependencies in package.json

### Common Errors

**"Module not found" errors:**
- Ensure requirements.txt includes all dependencies
- Check for typos in import statements

**"CORS policy" errors:**
- Add frontend URL to CORS origins in backend
- Redeploy backend after changes

**Video processing fails:**
- Check that ffmpeg is available (included in Render Python runtime)
- Verify upload directory permissions

## Free Tier Limitations

- **Backend**: 750 hours/month, spins down after 15 min of inactivity
- **Frontend**: Unlimited bandwidth, always on
- **First request after spin-down**: May take 30-60 seconds

## Monitoring

- **Logs**: Available in Render dashboard for each service
- **Metrics**: CPU, memory usage visible in dashboard
- **Alerts**: Set up email notifications for deployment failures

## Updating Your App

```bash
# Make changes to your code
git add .
git commit -m "Your update message"
git push origin main
```

Render will automatically detect the push and redeploy your services.

## Cost Optimization

1. **Use environment variables** for all secrets (never commit them)
2. **Enable auto-deploy** only for production branch
3. **Monitor usage** to avoid unexpected charges
4. **Consider upgrading** if you need:
   - No spin-down delays
   - More CPU/memory
   - Custom domains with SSL
