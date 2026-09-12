# AlgoCraft: Supabase, GitHub & Deployment Guide

This guide details how to link your Supabase Database & Auth, push your codebase to GitHub, and deploy the application to Vercel and Render for 100% free hosting.

---

## 1. Supabase Setup (Database & Authentication)

### Step 1: Create a Free Supabase Project
1. Navigate to [supabase.com](https://supabase.com) and click **Start your project** (free forever).
2. Choose a project name (e.g. `algocraft-dsa`) and database password.
3. Select a region close to you (e.g., `East US`, `South Asia / Mumbai`, `Central Europe`).

### Step 2: Execute the Database Schema
1. In your Supabase Dashboard, open the **SQL Editor** tab from the left sidebar.
2. Click **New Query**.
3. Open [`supabase_schema.sql`](./supabase_schema.sql) from the AlgoCraft root directory, copy its entire contents, paste it into the editor, and click **Run**.
4. This creates:
   - `profiles` table (linked to `auth.users`)
   - `solutions` table (storing user problem breakdowns and dry runs)
   - `saved_sheets` table (custom curated problem sheets)
   - `flashcard_progress` table (SM-2 spaced repetition tracking)
   - Row Level Security (RLS) policies ensuring users only view and edit their own data.

### Step 3: Copy API Credentials
1. Go to **Project Settings** (gear icon) -> **API**.
2. Copy:
   - **Project URL**
   - **Project API anon/public key**
3. In `client/`, create or update `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### (Optional) Enable GitHub OAuth Login
1. Go to **Authentication** -> **Providers** -> **GitHub**.
2. Toggle GitHub to **Enabled**.
3. Follow the instructions to create an OAuth App on GitHub Settings (`Authorized redirect URI`: `https://<your-project-id>.supabase.co/auth/v1/callback`).

---

## 2. GitHub Push Instructions

The local repository is initialized with a comprehensive [`.gitignore`](./.gitignore) excluding dependencies and environment files.

To push to your personal GitHub account:

### Step 1: Create a Repository on GitHub
1. Go to [github.com/new](https://github.com/new).
2. Name it `Algo-Craft` (or `algocraft`).
3. Set visibility to **Public** (or Private) and **do not** initialize with a README, .gitignore, or license (these already exist locally).

### Step 2: Link and Push
Run the following commands in your project terminal:

```bash
# Add your remote repository (replace with your GitHub username)
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/Algo-Craft.git

# Set main branch
git branch -M main

# Push all code
git push -u origin main
```

---

## 3. Frontend Deployment to Vercel (100% Free)

The client already includes a production-ready [`client/vercel.json`](./client/vercel.json) supporting React Router Single Page Application (SPA) rewrites.

### Step 1: Import Project on Vercel
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **Add New...** -> **Project**.
3. Import your `Algo-Craft` repository.

### Step 2: Configure Project Settings
- **Framework Preset**: Vite
- **Root Directory**: Click `Edit` and select `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Step 3: Add Environment Variables
Under **Environment Variables**, add:
- `VITE_SUPABASE_URL` = `https://your-project-id.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `your-anon-key`

Click **Deploy**! Your site will be live on a global `*.vercel.app` URL with automatic SSL and continuous deployment on every Git push.

---

## 4. Backend Deployment to Render (100% Free)

If you wish to host the Express AI server online:

1. Go to [render.com](https://render.com) and sign in.
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Plan**: Free
5. Add Environment Variables:
   - `GEMINI_API_KEY` = `your-gemini-key`
   - `PORT` = `5000`
6. Click **Create Web Service**.
7. In `client/vite.config.js` (or in client API configuration), set the API base URL to your Render service URL (e.g. `https://algocraft-api.onrender.com`).
