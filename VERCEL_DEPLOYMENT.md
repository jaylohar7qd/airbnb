# Vercel Deployment Setup Guide

## 🚀 Prerequisites

1. **Vercel Account**: Create a free account at [vercel.com](https://vercel.com)
2. **GitHub Integration**: Connect your GitHub repository to Vercel
3. **MongoDB Atlas Database**: Ensure you have a MongoDB cloud database

## 📋 Deployment Steps

### Step 1: Configure Environment Variables on Vercel

1. Go to your Vercel Project Settings
2. Navigate to **Environment Variables**
3. Add the following variables:

```
MONGO_DB_URI=mongodb+srv://username:password@cluster.mongodb.net/airbnb?appName=appname
NODE_ENV=production
SESSION_SECRET=your-very-secure-random-string-here
PORT=3000
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads
LOG_LEVEL=info
```

⚠️ **Important Security Notes:**
- Replace `MONGO_DB_URI` with your actual MongoDB Atlas connection string
- Generate a strong random `SESSION_SECRET` using:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- Use different values for production vs. staging if you have multiple environments

### Step 2: Deploy from GitHub

**Option A: Automatic Deployment (Recommended)**
- Push to your GitHub repository
- Vercel automatically builds and deploys on every push to `main` branch

**Option B: Manual Deployment via Vercel CLI**
```bash
npm install -g vercel
vercel --prod
```

### Step 3: Verify Deployment

1. Check the deployment status in Vercel dashboard
2. Test the health endpoint:
   ```
   https://your-project.vercel.app/api/health
   ```
3. Expected response:
   ```json
   {
     "status": "ok",
     "timestamp": "2026-02-17T...",
     "environment": "production",
     "uptime": 123.45
   }
   ```

## 🔍 Troubleshooting

### Function Invocation Failed (500 Error)

**Common Causes & Solutions:**

1. **Missing Environment Variables**
   - Ensure all required variables are set in Vercel dashboard
   - Check `MONGO_DB_URI` format is correct
   - Restart deployment after updating variables

2. **Database Connection Issues**
   ```
   Solutions:
   - Verify MongoDB connection string is correct
   - Check IP whitelist on MongoDB Atlas (add 0.0.0.0/0 for Vercel)
   - Ensure MongoDB cluster is not paused
   ```

3. **Module Import Errors**
   - Clear Vercel cache: Settings → Deployments → Clear Deployments
   - Rebuild: Push a new commit or redeploy manually

4. **Memory Issues**
   - Check function logs for memory errors
   - Reduce MAX_FILE_SIZE if needed
   - Optimize database queries

### Check Logs

1. In Vercel dashboard, go to **Deployments**
2. Click on your latest deployment
3. View **Function Logs** for error details

#### View logs in real-time:
```bash
vercel logs <project-url> --tail
```

## 📊 Production Configuration

### vercel.json Configuration
The `vercel.json` file includes:
- **Version 2**: Latest Vercel platform
- **Memory**: 1024MB per function
- **maxDuration**: 60 seconds timeout
- **Environment**: NODE_ENV set to production

### API Route Handler
- Entry point: `api/index.js`
- Exports Express app as serverless function
- Automatic database connection management
- Health check endpoint: `/api/health`

## 🔐 Security Checklist

- [ ] `SESSION_SECRET` is a strong random string (32+ characters)
- [ ] `MONGO_DB_URI` uses secure credentials
- [ ] MongoDB IP whitelist includes Vercel IPs
- [ ] `.env` file is NOT committed to GitHub
- [ ] Environment variables are set in Vercel dashboard
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] Cookies have `httpOnly` and `secure` flags

## 📈 Monitoring

### Health Check
Regularly monitor: `https://your-project.vercel.app/api/health`

### Error Monitoring
- Check Vercel dashboard for failed deployments
- Review function logs for runtime errors
- Monitor database connection status

## 🔄 Rollback Procedure

If deployment fails:
1. Go to Vercel Deployments
2. Find the previous successful deployment
3. Click "Promote to Production"
4. Fix the issue in code
5. Push corrected code to GitHub

## 📞 Additional Resources

- [Vercel Node.js Documentation](https://vercel.com/docs/concepts/functions/serverless-functions/node)
- [MongoDB Atlas Connection Guide](https://docs.atlas.mongodb.com/driver-connection)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Note**: The first deployment may take 2-3 minutes. Subsequent deployments are faster.
