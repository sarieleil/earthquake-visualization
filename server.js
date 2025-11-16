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
const db = require('./db/postgres-config');

// Get magnitude distribution
app.get('/api/magnitude-distribution', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        CASE 
          WHEN magnitude < 1 THEN 'Below 1'
          WHEN magnitude >= 1 AND magnitude < 2 THEN '1 to 2'
          WHEN magnitude >= 2 AND magnitude < 3 THEN '2 to 3'
          WHEN magnitude >= 3 AND magnitude < 4 THEN '3 to 4'
          WHEN magnitude >= 4 AND magnitude < 5 THEN '4 to 5'
          ELSE 'Above 5'
        END as magnitude_range,
        COUNT(*) as count
      FROM earthquakes
      GROUP BY magnitude_range
    `);
    
    const distribution = {};
    result.rows.forEach(row => {
      distribution[row.magnitude_range] = parseInt(row.count);
    });
    
    res.json(distribution);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get magnitude vs depth
app.get('/api/magnitude-vs-depth', async (req, res) => {
  try {
    const limit = req.query.limit || 100;
    const result = await db.query(
      'SELECT id, magnitude, depth FROM earthquakes ORDER BY timestamp DESC LIMIT $1',
      [limit]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get recent earthquakes
app.get('/api/recent-quakes', async (req, res) => {
  try {
    const limit = req.query.limit || 50;
    const result = await db.query(
      'SELECT * FROM earthquakes ORDER BY timestamp DESC LIMIT $1',
      [limit]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get depth distribution
app.get('/api/depth-distribution', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        CASE 
          WHEN depth < 5 THEN '0-5 km'
          WHEN depth >= 5 AND depth < 10 THEN '5-10 km'
          WHEN depth >= 10 AND depth < 15 THEN '10-15 km'
          WHEN depth >= 15 AND depth < 20 THEN '15-20 km'
          ELSE 'Above 20 km'
        END as depth_range,
        COUNT(*) as count
      FROM earthquakes
      GROUP BY depth_range
    `);
    
    const distribution = {};
    result.rows.forEach(row => {
      distribution[row.depth_range] = parseInt(row.count);
    });
    
    res.json(distribution);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Health check
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