# Deployment Guide for Render

## Quick Start Checklist

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] Database configured
- [ ] Environment variables set
- [ ] Application deployed

## Step-by-Step Deployment

### 1. Prepare Your Code

First, ensure your code is ready for deployment:

```bash
# Navigate to your project
cd quake-viz

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Earthquake visualization app"
```

### 2. Create GitHub Repository

#### Option A: Using GitHub Website
1. Go to https://github.com
2. Click "+" icon → "New repository"
3. Name: `earthquake-visualization`
4. Make it **public** (easier for free tier)
5. Don't initialize with README (you already have one)
6. Click "Create repository"

#### Option B: Using GitHub CLI
```bash
gh repo create earthquake-visualization --public --source=. --remote=origin
```

### 3. Push to GitHub

```bash
# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/earthquake-visualization.git

# Push code
git branch -M main
git push -u origin main
```

### 4. Sign Up for Render

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended)
4. Authorize Render to access your repositories

### 5. Create Database on Render (Optional)

If you don't already have a database:

#### For PostgreSQL:
1. In Render dashboard, click "New +" → "PostgreSQL"
2. Fill in details:
   - **Name**: `earthquake-db`
   - **Database**: `earthquakes` (or your choice)
   - **User**: `earthquake_user` (or your choice)
   - **Region**: Choose closest to you
   - **Plan**: Free (or paid if needed)
3. Click "Create Database"
4. **Important**: Save these connection details!
   - **Internal Database URL**: Use this for your app
   - **External Database URL**: Use for local testing
5. Wait for database to be provisioned (1-2 minutes)

#### Import Your Data:
```bash
# Connect to your Render database using external URL
psql <EXTERNAL_DATABASE_URL>

# Or use a GUI tool like pgAdmin with these details:
# Host: <from Render>
# Port: 5432
# Database: earthquakes
# Username: <from Render>
# Password: <from Render>

# Create table
CREATE TABLE earthquakes (
    id SERIAL PRIMARY KEY,
    magnitude DECIMAL(3,1),
    depth DECIMAL(5,1),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    location VARCHAR(255)
);

# Import your data
\copy earthquakes(magnitude, depth, latitude, longitude, location) FROM 'your-data.csv' CSV HEADER;
```

### 6. Create Web Service on Render

1. In Render dashboard, click "New +" → "Web Service"

2. **Connect Repository**:
   - Choose "Build and deploy from a Git repository"
   - Click "Next"
   - Select your `earthquake-visualization` repository
   - Click "Connect"

3. **Configure Service**:
   - **Name**: `earthquake-viz` (or your choice - this becomes your URL)
   - **Region**: Same as your database (if you created one)
   - **Branch**: `main`
   - **Root Directory**: Leave blank (or specify if in subdirectory)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid)

4. Click "Create Web Service" (don't worry about env vars yet)

### 7. Add Environment Variables

Your service will fail at first - that's OK! Now add environment variables:

1. In your service dashboard, click "Environment" in the left sidebar

2. Click "Add Environment Variable" and add each:

```
NODE_ENV=production
PORT=10000
DB_TYPE=postgres
DB_HOST=<your-database-host-from-render>
DB_PORT=5432
DB_NAME=earthquakes
DB_USER=<your-database-user>
DB_PASSWORD=<your-database-password>
DB_SSL=true
```

**Pro Tip**: If you created a database on Render, you can use the **Internal Database URL** and parse it:
```
DATABASE_URL=<INTERNAL_DATABASE_URL>
```
Then modify your code to parse this URL (see alternative method below).

3. Click "Save Changes"

### 8. Connect Database in Code

Open `server.js` and uncomment these lines:

```javascript
// Uncomment this line (around line 9):
const db = require('./db/postgres-config');

// Comment out or remove the sample data section
```

Make sure your `db/postgres-config.js` is using the environment variables correctly.

### 9. Redeploy

After adding environment variables:
1. Render will automatically redeploy
2. Watch the logs in the dashboard
3. Wait for "Deploy succeeded" message (2-5 minutes)

### 10. Test Your Application

Your app will be available at:
```
https://earthquake-viz.onrender.com
```
(Replace `earthquake-viz` with your actual service name)

Test these URLs:
- Main page: `https://earthquake-viz.onrender.com`
- Health check: `https://earthquake-viz.onrender.com/api/health`
- Data endpoint: `https://earthquake-viz.onrender.com/api/magnitude-distribution`

## Alternative: Using DATABASE_URL

If you want to use a single `DATABASE_URL` environment variable:

### 1. Add this package:
```bash
npm install pg-connection-string
```

### 2. Update `db/postgres-config.js`:
```javascript
const { Pool } = require('pg');
const { parse } = require('pg-connection-string');

let config;

if (process.env.DATABASE_URL) {
  // Parse DATABASE_URL
  config = parse(process.env.DATABASE_URL);
  config.ssl = { rejectUnauthorized: false };
} else {
  // Use individual environment variables
  config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  };
}

const pool = new Pool(config);

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
```

### 3. In Render, just set:
```
DATABASE_URL=<INTERNAL_DATABASE_URL>
```

## Troubleshooting

### Build Failed
- Check logs in Render dashboard
- Ensure `package.json` has correct dependencies
- Verify Node.js version compatibility

### Database Connection Error
```
Error: connect ECONNREFUSED
```
**Solution**: Check your database credentials in environment variables

### Module Not Found
```
Error: Cannot find module 'express'
```
**Solution**: 
1. Ensure `package.json` includes all dependencies
2. Build command is `npm install`
3. Trigger manual deploy

### Application Crashes on Start
```
Error: listen EADDRINUSE
```
**Solution**: Don't hardcode port 3000, use:
```javascript
const PORT = process.env.PORT || 3000;
```

### Environment Variables Not Working
- Check spelling carefully
- Save changes after adding vars
- Trigger a new deployment after saving

### SSL/TLS Error with Database
```
Error: self signed certificate
```
**Solution**: Set `DB_SSL=true` and ensure config has:
```javascript
ssl: { rejectUnauthorized: false }
```

## Updating Your Application

When you make changes:

```bash
# Make your changes
# ...

# Commit changes
git add .
git commit -m "Description of changes"

# Push to GitHub
git push origin main

# Render will automatically detect the push and redeploy!
```

## Free Tier Limitations

Render's free tier:
- ✅ 750 hours/month compute time
- ✅ Automatic HTTPS
- ✅ Auto-deploy from GitHub
- ⚠️ Spins down after 15 min inactivity
- ⚠️ Cold start takes 30-60 seconds
- ⚠️ Free PostgreSQL only 90 days (then need to pay or migrate)

**Pro Tip**: For the assignment, free tier is perfect!

## Custom Domain (Optional)

1. Buy a domain (e.g., from Namecheap, Google Domains)
2. In Render dashboard → "Settings" → "Custom Domain"
3. Add your domain
4. Update DNS records as shown by Render
5. Wait for SSL certificate (automatic, ~5 minutes)

## Viewing Logs

To debug issues:
1. Go to your service in Render
2. Click "Logs" tab
3. See real-time logs
4. Use filters to find errors

## Monitoring

Render provides:
- Real-time logs
- Deploy history
- Resource usage
- Health checks

Check these regularly to ensure everything runs smoothly!

## Before Submitting Assignment

✅ Checklist:
- [ ] Application loads without errors
- [ ] All visualizations work
- [ ] Pie chart displays correctly
- [ ] Bar chart displays correctly  
- [ ] Scatter plot displays correctly
- [ ] Tooltips appear on hover
- [ ] Statistics panel shows data
- [ ] Responsive on mobile (test with phone)
- [ ] Database connected and returning real data
- [ ] GitHub repository is accessible
- [ ] README.md explains the project

## Support Resources

- Render Docs: https://render.com/docs
- Node.js Docs: https://nodejs.org/docs
- D3.js Examples: https://observablehq.com/@d3/gallery
- PostgreSQL Render Guide: https://render.com/docs/databases

## Common URLs for Your Project

Replace `earthquake-viz` with your service name:

- **Application**: https://earthquake-viz.onrender.com
- **GitHub**: https://github.com/YOUR_USERNAME/earthquake-visualization
- **Render Dashboard**: https://dashboard.render.com

---

Good luck with your deployment! 🚀
