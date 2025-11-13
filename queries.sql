-- Sample SQL Queries for Earthquake Visualization
-- Replace these queries in server.js based on your actual table structure

-- ================================================
-- POSTGRESQL QUERIES
-- ================================================

-- 1. Magnitude Distribution (for Pie Chart / Bar Chart)
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
ORDER BY 
  CASE 
    WHEN magnitude < 1 THEN 1
    WHEN magnitude >= 1 AND magnitude < 2 THEN 2
    WHEN magnitude >= 2 AND magnitude < 3 THEN 3
    WHEN magnitude >= 3 AND magnitude < 4 THEN 4
    WHEN magnitude >= 4 AND magnitude < 5 THEN 5
    ELSE 6
  END;

-- 2. Depth Distribution (for Bar Chart)
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
ORDER BY 
  CASE 
    WHEN depth < 5 THEN 1
    WHEN depth >= 5 AND depth < 10 THEN 2
    WHEN depth >= 10 AND depth < 15 THEN 3
    WHEN depth >= 15 AND depth < 20 THEN 4
    ELSE 5
  END;

-- 3. Magnitude vs Depth (for Scatter Plot)
-- Get the 100 most recent earthquakes
SELECT 
  id,
  magnitude,
  depth,
  latitude,
  longitude,
  timestamp
FROM earthquakes
ORDER BY timestamp DESC
LIMIT 100;

-- 4. Recent Earthquakes with all details
SELECT 
  id,
  magnitude,
  depth,
  latitude,
  longitude,
  location,
  timestamp
FROM earthquakes
ORDER BY timestamp DESC
LIMIT 50;

-- 5. Statistics for a specific time range
SELECT 
  COUNT(*) as total_quakes,
  AVG(magnitude) as avg_magnitude,
  MAX(magnitude) as max_magnitude,
  MIN(magnitude) as min_magnitude,
  AVG(depth) as avg_depth,
  MAX(depth) as max_depth,
  MIN(depth) as min_depth
FROM earthquakes
WHERE timestamp >= NOW() - INTERVAL '30 days';

-- ================================================
-- MYSQL QUERIES
-- ================================================

-- 1. Magnitude Distribution (MySQL)
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
ORDER BY 
  CASE 
    WHEN magnitude < 1 THEN 1
    WHEN magnitude >= 1 AND magnitude < 2 THEN 2
    WHEN magnitude >= 2 AND magnitude < 3 THEN 3
    WHEN magnitude >= 3 AND magnitude < 4 THEN 4
    WHEN magnitude >= 4 AND magnitude < 5 THEN 5
    ELSE 6
  END;

-- 2. Magnitude vs Depth (MySQL)
SELECT 
  id,
  magnitude,
  depth,
  latitude,
  longitude,
  timestamp
FROM earthquakes
ORDER BY timestamp DESC
LIMIT ?;  -- Parameter for limit

-- ================================================
-- EXAMPLE: How to integrate in server.js
-- ================================================

/*
// PostgreSQL Example
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
    
    // Convert to object format expected by frontend
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

// MySQL Example
app.get('/api/magnitude-vs-depth', async (req, res) => {
  try {
    const limit = req.query.limit || 100;
    const [rows] = await db.query(
      'SELECT id, magnitude, depth FROM earthquakes ORDER BY timestamp DESC LIMIT ?',
      [limit]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});
*/

-- ================================================
-- TABLE CREATION (if needed)
-- ================================================

-- PostgreSQL
CREATE TABLE IF NOT EXISTS earthquakes (
    id SERIAL PRIMARY KEY,
    magnitude DECIMAL(3,1),
    depth DECIMAL(5,1),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MySQL
CREATE TABLE IF NOT EXISTS earthquakes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    magnitude DECIMAL(3,1),
    depth DECIMAL(5,1),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- SAMPLE DATA INSERT (for testing)
-- ================================================

INSERT INTO earthquakes (magnitude, depth, latitude, longitude, location) VALUES
(0.8, 5.2, 35.5012, -120.3456, 'California'),
(1.5, 8.7, 36.1234, -121.0012, 'California'),
(2.3, 12.1, 35.8901, -120.7654, 'California'),
(1.9, 6.5, 36.3456, -121.5432, 'California'),
(3.5, 15.8, 35.2345, -119.8765, 'California'),
(0.6, 3.9, 36.5678, -120.2345, 'California'),
(2.7, 13.2, 35.7890, -121.2345, 'California'),
(1.3, 7.8, 36.2345, -120.9876, 'California'),
(4.2, 18.5, 35.4567, -120.5678, 'California'),
(1.1, 5.4, 36.0123, -121.1234, 'California');
