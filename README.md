# Earthquake Data Visualization

A cloud-based data visualization application for earthquake data using D3.js, Node.js, and Express.

## Features

- 📊 **Multiple Visualization Types**
  - Pie Chart: Magnitude distribution
  - Bar Chart: Magnitude/depth distribution
  - Scatter Plot: Magnitude vs depth correlation

- 🎨 **Interactive D3.js Graphics**
  - Smooth animations
  - Hover tooltips
  - Responsive design

- ☁️ **Cloud Deployment Ready**
  - Configured for Render
  - Environment-based configuration
  - PostgreSQL/MySQL support

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript, D3.js v7
- **Backend**: Node.js, Express
- **Database**: PostgreSQL or MySQL
- **Cloud**: Render (or any cloud provider)

## Local Development Setup

### Prerequisites

- Node.js 18+ installed
- Git installed
- Database (PostgreSQL or MySQL) with earthquake data

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd quake-viz
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your database credentials:
   ```env
   PORT=3000
   DB_TYPE=postgres  # or mysql
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=earthquakes
   DB_USER=your_username
   DB_PASSWORD=your_password
   ```

4. **Connect to your database**
   
   Open `server.js` and uncomment the appropriate database configuration:
   ```javascript
   // For PostgreSQL:
   const db = require('./db/postgres-config');
   
   // For MySQL:
   // const db = require('./db/mysql-config');
   ```

5. **Update API endpoints with real queries**
   
   In `server.js`, replace the sample data with actual SQL queries:
   ```javascript
   // Example for PostgreSQL:
   app.get('/api/magnitude-distribution', async (req, res) => {
     try {
       const result = await db.query(`
         SELECT 
           CASE 
             WHEN magnitude < 1 THEN 'Below 1'
             WHEN magnitude < 2 THEN '1 to 2'
             WHEN magnitude < 3 THEN '2 to 3'
             WHEN magnitude < 4 THEN '3 to 4'
             WHEN magnitude < 5 THEN '4 to 5'
             ELSE 'Above 5'
           END as category,
           COUNT(*) as count
         FROM earthquakes
         GROUP BY category
         ORDER BY category
       `);
       
       const distribution = {};
       result.rows.forEach(row => {
         distribution[row.category] = parseInt(row.count);
       });
       
       res.json(distribution);
     } catch (error) {
       console.error(error);
       res.status(500).json({ error: 'Database error' });
     }
   });
   ```

6. **Run the application**
   ```bash
   npm start
   ```

7. **Open in browser**
   ```
   http://localhost:3000
   ```

## Cloud Deployment to Render

### Step 1: Prepare Your Repository

1. **Initialize Git (if not already done)**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub**
   ```bash
   git remote add origin <your-github-repo-url>
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Render

1. **Go to [Render.com](https://render.com)** and sign in

2. **Create a new Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your `quake-viz` repository

3. **Configure the service**
   - **Name**: `quake-visualization` (or your choice)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free or paid (your choice)

4. **Add environment variables**
   
   In Render dashboard, go to "Environment" and add:
   ```
   PORT=3000
   NODE_ENV=production
   DB_TYPE=postgres
   DB_HOST=your-db-host
   DB_PORT=5432
   DB_NAME=earthquakes
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_SSL=true
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy your app
   - Wait for deployment to complete (usually 2-5 minutes)

### Step 3: Set Up Database on Render (Optional)

If you don't have a database yet:

1. **Create PostgreSQL Database**
   - In Render dashboard, click "New +" → "PostgreSQL"
   - Choose a name and plan
   - Click "Create Database"

2. **Get connection details**
   - Copy the "Internal Database URL" or individual credentials
   - Add these to your Web Service environment variables

3. **Create tables and import data**
   ```sql
   CREATE TABLE earthquakes (
       id SERIAL PRIMARY KEY,
       magnitude DECIMAL(3,1),
       depth DECIMAL(5,1),
       latitude DECIMAL(9,6),
       longitude DECIMAL(9,6),
       timestamp TIMESTAMP,
       location VARCHAR(255)
   );
   
   -- Import your earthquake data
   COPY earthquakes FROM 'your-data-file.csv' CSV HEADER;
   ```

### Step 4: Access Your Application

Your app will be available at:
```
https://your-app-name.onrender.com
```

## Database Schema

Expected table structure:

```sql
CREATE TABLE earthquakes (
    id INTEGER PRIMARY KEY,
    magnitude DECIMAL(3,1),
    depth DECIMAL(5,1),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    timestamp TIMESTAMP,
    location VARCHAR(255)
);
```

## API Endpoints

- `GET /api/magnitude-distribution` - Returns earthquake count by magnitude range
- `GET /api/depth-distribution` - Returns earthquake count by depth range
- `GET /api/magnitude-vs-depth?limit=100` - Returns magnitude and depth pairs
- `GET /api/recent-quakes?limit=50` - Returns recent earthquake data
- `GET /api/health` - Health check endpoint

## Visualization Types

### 1. Pie Chart
- Shows magnitude distribution as pie slices
- Color-coded categories
- Percentage labels
- Interactive tooltips

### 2. Bar Chart
- Vertical bars showing distribution
- Value labels on top
- Hover effects
- Multiple themes (magnitude/depth)

### 3. Scatter Plot
- X-axis: Magnitude
- Y-axis: Depth
- Color gradient based on magnitude
- Interactive points with details

## Customization

### Change Colors

Edit `public/js/visualizations.js`:
```javascript
this.colors = d3.schemeSet3;  // Try: d3.schemeSet2, d3.schemePastel1, etc.
```

### Adjust Chart Size

Edit `public/js/visualizations.js`:
```javascript
const width = 800;   // Change width
const height = 600;  // Change height
```

### Modify Magnitude Ranges

Edit `server.js` in the `/api/magnitude-distribution` endpoint

## Troubleshooting

### Port already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database connection error
- Check your `.env` file credentials
- Ensure database is running
- Verify firewall settings allow connections

### Render deployment fails
- Check build logs in Render dashboard
- Verify all environment variables are set
- Ensure `package.json` has correct start script

### Charts not displaying
- Check browser console for JavaScript errors
- Verify API endpoints are returning data
- Test API endpoints directly: `https://your-app.onrender.com/api/health`

## Project Structure

```
quake-viz/
├── db/
│   ├── postgres-config.js    # PostgreSQL connection
│   └── mysql-config.js       # MySQL connection
├── public/
│   ├── css/
│   │   └── styles.css        # Application styles
│   ├── js/
│   │   ├── app.js            # Main app logic
│   │   └── visualizations.js # D3.js charts
│   └── index.html            # Main page
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
├── package.json              # Dependencies
├── server.js                 # Express server
└── README.md                 # This file
```

## Assignment Requirements ✅

- ✅ Uses public cloud service (Render)
- ✅ No local installation required
- ✅ Browser-based visualization using D3.js
- ✅ Multiple chart types (pie, bar, scatter)
- ✅ Interactive user interface
- ✅ SQL database integration
- ✅ Web service hosting
- ✅ Responsive design
- ✅ Professional appearance

## Resources

- [D3.js Documentation](https://d3js.org)
- [Render Documentation](https://render.com/docs)
- [Express.js Guide](https://expressjs.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

## License

MIT License - Feel free to use for educational purposes

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Render deployment logs
3. Verify database connections
4. Check browser console for errors

---

**CSE 6332 Cloud Computing - Fall 2025**
