# Vercel Deployment Debugging Guide

## 🔍 Your Serverless Function Error

You're getting a **500 INTERNAL_SERVER_ERROR** with **FUNCTION_INVOCATION_FAILED**. Here's how to diagnose and fix it:

## ✅ Step 1: Verify Environment Variables on Vercel

Go to your Vercel project → **Settings** → **Environment Variables**

Make sure ALL these are set:
```
✓ MONGO_DB_URI = mongodb+srv://loharjai6_db:jay@jay.yskdkdi.mongodb.net/airbnb?appName=jay
✓ NODE_ENV = production
✓ SESSION_SECRET = (strong random string - NOT "Knowloedge AI with Complete Coding")
✓ MAX_FILE_SIZE = 5242880
✓ UPLOAD_DIR = uploads
✓ LOG_LEVEL = info
```

**Generate a secure SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Example output: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

⚠️ **Common Issue**: If you used the `.env` file values, update them now with proper secure values.

## ✅ Step 2: Check MongoDB Atlas Configuration

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click **Network Access**
3. Click **Add IP Address**
4. For Vercel, select **Allow Access from Anywhere** (0.0.0.0/0)
   - ⚠️ This is required for Vercel's dynamic IPs
5. Click **Confirm**

## ✅ Step 3: View Function Logs on Vercel

1. Go to Vercel Dashboard
2. Select your project
3. Go to **Deployments** tab
4. Click your latest deployment
5. Click **Function Logs** tab
6. Look for error messages

Search for these keywords:
- `✗ MongoDB Connection Error` - Database connection failed
- `✗ Missing required environment variables` - Env vars not set
- `Cannot find module` - Missing dependency

## ✅ Step 4: Test Health Check Endpoint

Once Vercel redeploys, visit this URL in your browser:
```
https://your-project.vercel.app/api/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "2026-02-17T...",
  "environment": "production",
  "uptime": 1.234,
  "mongoDbConnected": false
}
```

If you see an error, the function is crashing at startup.

## 🔧 Step 5: Redeploy with Latest Code

### Option A: Automatic (Recommended)
1. Your code is already pushed to GitHub
2. Vercel should automatically redeploy
3. Wait 2-3 minutes for deployment to complete

### Option B: Manual Redeploy on Vercel
1. Go to **Deployments** tab
2. Find the failed deployment
3. Click **...** (three dots)
4. Click **Redeploy**

### Option C: Push New Commit
```bash
git commit --allow-empty -m "chore: trigger vercel redeploy"
git push origin main
```

## 📊 What Was Fixed

Your code now has:
- ✓ Better environment variable validation
- ✓ Detailed logging for debugging
- ✓ Improved MongoDB error messages
- ✓ Health check endpoint that works without database
- ✓ Better error handling for missing dependencies

## 🆘 If It Still Doesn't Work

### Check MongoDB Connection String

Your MONGO_DB_URI should look like:
```
mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/airbnb?appName=jay
```

Verify these:
1. **USERNAME** and **PASSWORD** are correct (with special characters URL-encoded if needed)
2. **cluster** name matches your MongoDB Atlas cluster
3. Database name is `airbnb`
4. No typos in the URL

### Common MongoDB Connection Errors

| Error | Solution |
|-------|----------|
| `ECONNREFUSED` | Check IP whitelist on MongoDB Atlas (allow 0.0.0.0/0 for Vercel) |
| `authentication failed` | Verify username/password in MONGO_DB_URI |
| `ENOTFOUND` | Check cluster name spelling in connection string |
| `EACCES` / `EPERM` | MongoDB user doesn't have permission - regenerate API key |

### Check Function Logs for Specific Error

In Vercel → **Deployments** → **Function Logs**, look for:

```
✗ Missing required environment variables: SESSION_SECRET, MONGO_DB_URI
```
→ Add these to Vercel Settings

```
✗ MongoDB Connection Error: getaddrinfo ENOTFOUND
```
→ Check your MongoDB connection string for typos

```
✗ MongoDB Connection Error: authentication failed
```
→ Check MongoDB username and password

## ✅ Final Checklist

- [ ] All environment variables are set in Vercel Settings
- [ ] SESSION_SECRET is set to a strong random string (32+ characters)
- [ ] MONGO_DB_URI is correct and matches your MongoDB Atlas cluster
- [ ] MongoDB Atlas IP whitelist includes 0.0.0.0/0 for Vercel
- [ ] Vercel deployment is complete (no red X)
- [ ] Health check endpoint returns `"status": "ok"`
- [ ] Code is pushed to GitHub main branch

---

**Next Steps:**
1. Update environment variables on Vercel
2. Update MongoDB Atlas IP whitelist
3. Redeploy on Vercel
4. Test `/api/health` endpoint
5. Check Function Logs for errors
6. Let me know what error message you see in the logs!
