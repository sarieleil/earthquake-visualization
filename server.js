require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Import database configuration
// Choose one based on your database type:
const db = require('./db/postgres-config');  // For PostgreSQL
// const db = require('./db/mysql-config');     // For MySQL

// For demonstration, using in-memory sample data
// Replace this with actual database queries
const sampleQuakeData = [
  { id: 1, magnitude: 0.5, depth: 5.2, latitude: 35.5, longitude: -120.3, timestamp: '2024-11-01 10:23:45' },
  { id: 2, magnitude: 1.2, depth: 8.5, latitude: 36.1, longitude: -121.0, timestamp: '2024-11-01 11:15:30' },
  { id: 3, magnitude: 2.1, depth: 10.3, latitude: 35.8, longitude: -120.7, timestamp: '2024-11-01 12:45:22' },
  { id: 4, magnitude: 1.8, depth: 6.7, latitude: 36.3, longitude: -121.5, timestamp: '2024-11-01 14:20:10' },
  { id: 5, magnitude: 3.2, depth: 15.1, latitude: 35.2, longitude: -119.8, timestamp: '2024-11-01 15:30:55' },
  { id: 6, magnitude: 0.8, depth: 4.2, latitude: 36.5, longitude: -120.2, timestamp: '2024-11-01 16:10:30' },
  { id: 7, magnitude: 2.5, depth: 12.8, latitude: 35.7, longitude: -121.2, timestamp: '2024-11-02 08:45:15' },
  { id: 8, magnitude: 1.5, depth: 7.3, latitude: 36.2, longitude: -120.9, timestamp: '2024-11-02 09:22:40' },
  { id: 9, magnitude: 4.1, depth: 18.5, latitude: 35.4, longitude: -120.5, timestamp: '2024-11-02 10:55:20' },
  { id: 10, magnitude: 1.1, depth: 5.8, latitude: 36.0, longitude: -121.1, timestamp: '2024-11-02 12:15:45' }
];

// API Routes

// Get magnitude distribution (for pie chart / bar chart)
app.get('/api/magnitude-distribution', async (req, res) => {
  try {
    // In production, replace with actual SQL query:
    // const result = await db.query('SELECT ...');
    
    const distribution = {
      'Below 1': 0,
      '1 to 2': 0,
      '2 to 3': 0,
      '3 to 4': 0,
      '4 to 5': 0,
      'Above 5': 0
    };

    sampleQuakeData.forEach(quake => {
      const mag = quake.magnitude;
      if (mag < 1) distribution['Below 1']++;
      else if (mag < 2) distribution['1 to 2']++;
      else if (mag < 3) distribution['2 to 3']++;
      else if (mag < 4) distribution['3 to 4']++;
      else if (mag < 5) distribution['4 to 5']++;
      else distribution['Above 5']++;
    });

    res.json(distribution);
  } catch (error) {
    console.error('Error fetching magnitude distribution:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get magnitude vs depth (for scatter plot)
app.get('/api/magnitude-vs-depth', async (req, res) => {
  try {
    const limit = req.query.limit || 100;
    
    // In production, replace with actual SQL query:
    // const result = await db.query('SELECT magnitude, depth FROM earthquakes ORDER BY timestamp DESC LIMIT ?', [limit]);
    
    const data = sampleQuakeData.slice(0, limit).map(quake => ({
      magnitude: quake.magnitude,
      depth: quake.depth,
      id: quake.id
    }));

    res.json(data);
  } catch (error) {
    console.error('Error fetching magnitude vs depth:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent earthquakes
app.get('/api/recent-quakes', async (req, res) => {
  try {
    const limit = req.query.limit || 50;
    
    // In production, replace with actual SQL query
    const data = sampleQuakeData.slice(0, limit);
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching recent quakes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get depth distribution
app.get('/api/depth-distribution', async (req, res) => {
  try {
    const distribution = {
      '0-5 km': 0,
      '5-10 km': 0,
      '10-15 km': 0,
      '15-20 km': 0,
      'Above 20 km': 0
    };

    sampleQuakeData.forEach(quake => {
      const depth = quake.depth;
      if (depth < 5) distribution['0-5 km']++;
      else if (depth < 10) distribution['5-10 km']++;
      else if (depth < 15) distribution['10-15 km']++;
      else if (depth < 20) distribution['15-20 km']++;
      else distribution['Above 20 km']++;
    });

    res.json(distribution);
  } catch (error) {
    console.error('Error fetching depth distribution:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the application`);
});
