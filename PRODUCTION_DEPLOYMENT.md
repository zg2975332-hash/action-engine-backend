# 🚀 Production Deployment Guide

Complete guide to deploy AetherFlow for 24/7 availability with downloadable APK.

---

## 📋 Overview

**Goal:** Deploy backend 24/7 + Build APK that anyone can download and use

**Steps:**
1. Deploy backend to cloud (24/7 running)
2. Update frontend with production backend URL
3. Build production APK
4. Distribute APK link

---

## 🌐 Step 1: Deploy Backend (Choose One)

### Option A: Railway.app (EASIEST - RECOMMENDED)

**Why:** Free $5 credit, no credit card, one-click deploy

#### Instructions:

1. **Push code to GitHub** (if not already)
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to Railway.app**
   - Visit: https://railway.app/
   - Click "Start a New Project"
   - Login with GitHub

3. **Deploy from GitHub**
   - Click "Deploy from GitHub repo"
   - Select your repository
   - Select `backend` folder as root directory

4. **Add Environment Variables**
   - Click on your service
   - Go to "Variables" tab
   - Add these variables:
     ```
     GOOGLE_GENAI_USE_VERTEXAI=TRUE
     GOOGLE_CLOUD_PROJECT=your-project-id
     GOOGLE_CLOUD_LOCATION=us-central1
     MODEL_NAME=gemini-2.5-flash
     PORT=8000
     ```

5. **Deploy**
   - Railway auto-deploys
   - Wait 2-3 minutes
   - Get your URL: `https://aetherflow-backend.up.railway.app`

6. **Test Backend**
   ```bash
   curl https://your-railway-url.railway.app/api/health
   ```

---

### Option B: Render.com (100% FREE)

**Why:** Completely free, no credit card needed

#### Instructions:

1. **Push code to GitHub**

2. **Go to Render.com**
   - Visit: https://render.com/
   - Sign up with GitHub

3. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Select repository

4. **Configure Service**
   - **Name:** aetherflow-backend
   - **Root Directory:** `backend`
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

5. **Add Environment Variables**
   ```
   GOOGLE_GENAI_USE_VERTEXAI=TRUE
   GOOGLE_CLOUD_PROJECT=your-project-id
   GOOGLE_CLOUD_LOCATION=us-central1
   MODEL_NAME=gemini-2.5-flash
   ```

6. **Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes
   - Get URL: `https://aetherflow-backend.onrender.com`

**Note:** Free tier sleeps after 15 min of inactivity. First request takes 30s to wake up.

---

### Option C: Google Cloud Run (ADVANCED)

**Why:** Best performance, auto-scaling, Vertex AI integrated

#### Instructions:

1. **Install Google Cloud SDK**
   - Download: https://cloud.google.com/sdk/docs/install

2. **Login and Set Project**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **Enable APIs**
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   ```

4. **Deploy**
   ```bash
   cd backend
   
   gcloud run deploy aetherflow-backend \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars GOOGLE_GENAI_USE_VERTEXAI=TRUE,GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID,GOOGLE_CLOUD_LOCATION=us-central1,MODEL_NAME=gemini-2.5-flash
   ```

5. **Get URL**
   - URL: `https://aetherflow-backend-xxxxx-uc.a.run.app`

---

## 📱 Step 2: Update Frontend with Production URL

After backend is deployed, update frontend:

1. **Open `frontend/services/api.ts`**

2. **Update PRODUCTION_API_URL**
   ```typescript
   const PRODUCTION_API_URL = 'https://your-actual-backend-url.com';
   ```

   Replace with your actual backend URL from Step 1:
   - Railway: `https://aetherflow-backend.up.railway.app`
   - Render: `https://aetherflow-backend.onrender.com`
   - Cloud Run: `https://aetherflow-backend-xxxxx-uc.a.run.app`

3. **Save file**

---

## 📦 Step 3: Build Production APK

### Using EAS Build (Recommended):

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login to Expo
eas login

# 3. Go to frontend
cd frontend

# 4. Configure (first time only)
eas build:configure

# 5. Build production APK
eas build -p android --profile preview
```

**Wait 10-15 minutes for build to complete.**

### Download APK:
- Check email for build link
- Or visit: https://expo.dev/accounts/YOUR_USERNAME/projects/aetherflow/builds
- Download APK file

---

## 🔗 Step 4: Distribute APK

### Option 1: GitHub Releases (Recommended)

1. **Go to your GitHub repo**
2. **Click "Releases"** → "Create a new release"
3. **Upload APK file**
4. **Add release notes:**
   ```
   # AetherFlow v1.0.0
   
   ## Download
   - [Download APK](link-to-apk)
   
   ## Installation
   1. Download APK
   2. Enable "Install from Unknown Sources" in Android settings
   3. Tap APK to install
   4. Open AetherFlow app
   
   ## Features
   - Content-to-Action AI agent
   - 6-phase pipeline
   - Action simulation
   - Multi-language support
   ```
5. **Publish release**
6. **Share link:** `https://github.com/YOUR_USERNAME/YOUR_REPO/releases`

### Option 2: Google Drive

1. Upload APK to Google Drive
2. Right-click → "Get link"
3. Set to "Anyone with the link"
4. Share link

### Option 3: Firebase App Distribution

1. Go to: https://console.firebase.google.com/
2. Create project
3. Go to "App Distribution"
4. Upload APK
5. Get shareable link

---

## ✅ Testing Production Setup

### Test Backend:
```bash
# Health check
curl https://your-backend-url.com/api/health

# Should return:
# {"status":"healthy","service":"AetherFlow Agent Pipeline","version":"1.0.0"}
```

### Test APK:
1. Download APK on Android device
2. Install APK
3. Open app
4. Try sample scenario
5. Verify it connects to production backend
6. Check insights and simulation work

---

## 🎯 Complete Deployment Checklist

### Backend Deployment:
- [ ] Backend deployed to cloud (Railway/Render/Cloud Run)
- [ ] Backend URL is accessible
- [ ] Health endpoint returns 200 OK
- [ ] Environment variables configured
- [ ] Vertex AI authentication working

### Frontend Update:
- [ ] Production URL updated in `api.ts`
- [ ] Code committed to Git
- [ ] No hardcoded localhost URLs

### APK Build:
- [ ] EAS build completed successfully
- [ ] APK downloaded
- [ ] APK tested on device
- [ ] App connects to production backend
- [ ] All features working

### Distribution:
- [ ] APK uploaded to GitHub/Drive/Firebase
- [ ] Download link is public
- [ ] Installation instructions provided
- [ ] Link tested from different device

---

## 📊 Cost Breakdown

| Service | Free Tier | Paid (if needed) |
|---------|-----------|------------------|
| **Railway** | $5 credit/month | $5/month after credit |
| **Render** | 750 hours/month | $7/month for always-on |
| **Cloud Run** | 2M requests/month | Pay per use |
| **EAS Build** | Free | $29/month for unlimited |
| **GitHub** | Free | Free |

**Recommended for Hackathon:** Railway or Render (both free)

---

## 🔧 Troubleshooting

### Backend not accessible:
- Check deployment logs
- Verify environment variables
- Test health endpoint
- Check firewall/CORS settings

### APK can't connect to backend:
- Verify PRODUCTION_API_URL is correct
- Check backend is running
- Test backend URL in browser
- Rebuild APK after URL change

### APK won't install:
- Enable "Install from Unknown Sources"
- Check Android version (min 5.0)
- Try uninstalling old version first

### Backend sleeps (Render free tier):
- First request takes 30s to wake up
- Upgrade to paid plan for always-on
- Or use Railway/Cloud Run

---

## 🚀 Quick Deployment (TL;DR)

```bash
# 1. Deploy backend to Railway.app (5 minutes)
# - Go to railway.app
# - Deploy from GitHub
# - Add environment variables
# - Get URL

# 2. Update frontend (1 minute)
# - Edit frontend/services/api.ts
# - Update PRODUCTION_API_URL
# - Save

# 3. Build APK (15 minutes)
cd frontend
eas build -p android --profile preview
# Wait for build
# Download APK

# 4. Distribute (2 minutes)
# - Upload to GitHub Releases
# - Share link
```

**Total Time:** ~25 minutes

---

## 📱 Final APK Link Format

Share this with users:

```
🚀 AetherFlow - Content-to-Action AI Agent

📥 Download APK:
https://github.com/YOUR_USERNAME/YOUR_REPO/releases/download/v1.0.0/aetherflow.apk

📖 Installation:
1. Download APK
2. Enable "Install from Unknown Sources" in Settings
3. Tap APK to install
4. Open AetherFlow

✨ Features:
- AI-powered content analysis
- 6-phase agent pipeline
- Action simulation
- Multi-language support

🔗 Backend: https://your-backend-url.com
📺 Demo Video: [YouTube Link]
💻 Source Code: [GitHub Link]
```

---

**Your app is now live 24/7 and anyone can download the APK!** 🎉
