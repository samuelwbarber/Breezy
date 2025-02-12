const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); 

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${port}`);
});

// MySQL Connection (Single Connection)
const db = mysql.createConnection({
  host: '18.134.180.224',
  user: 'remote_user2',
  password: 'Embedded2025!',
  database: 'DB2',
});

// Connect to MySQL
db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL');
});

// Login 
app.post('/login', async (req, res) => {
  const { email } = req.body;
  console.log("Email:", email);
  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }

  try {
    const query = 'SELECT ID, NAME, EMAIL FROM USER WHERE EMAIL = ?';
    
    db.query(query, [email], (err, rows) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ error: 'Database query failed' });
      }

      if (rows.length === 0) {
        console.log('User not found');
        return res.status(401).json({ error: 'User not found' });
      }

      const user = rows[0];
      console.log('User found:', user);
      res.status(200).json({
        id: user.ID,
        name: user.NAME,
        email: user.EMAIL,
      });
    });

  } catch (err) {
    console.error('Unexpected server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/signUp', async (req, res) => {
  const { email, username, id } = req.body;
  console.log("Email:", email);
  console.log("Username:", username);
  console.log("ID:", id);
  
  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }

  try {
    // Use a parameterized query to avoid SQL injection.
    const query = "INSERT INTO USER (ID, NAME, EMAIL) VALUES (?, ?, ?);";
    
    db.query(query, [id, username, email], (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ error: 'Database query failed' });
      }
      
      // Check if a row was inserted.
      if (results.affectedRows > 0) {
        return res.status(200).json({ message: 'User created successfully' });
      } else {
        return res.status(500).json({ error: 'User not created' });
      }
    });
  } catch (err) {
    console.error('Unexpected server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});



app.post('/location-data/:userId', async (req, res) => {
  
  const userId = req.params.userId;
  const { latitude, longitude, timestamp } = req.body;
  const formattedTimestamp = new Date(timestamp).toISOString().slice(0, 19).replace("T", " ");

  if ( !latitude || !longitude || !timestamp ) {
    return res.status(400).json({ error: 'Missing required data' });
  }

  try {
    
    const query = 'INSERT INTO ENTRY (ID, LONGITUDE, LATITUDE, ENTRY_TIME, ECO2, TVOC) VALUES (?, ?, ?, ?, NULL, NULL);';
    db.query(query, [userId, longitude, latitude, formattedTimestamp], (err, results) => {
      if (err) {
        console.error('Error inserting location data:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      console.log('Location data inserted successfully');
      res.status(201).json({ message: 'Location data stored successfully' });
    });

  } catch (err){
    console.error("Unexpected server error:", err);
    res.status(500).json({ error: "Server error" });
  }


});


// Retreive Heatmap Data
app.get('/user-data/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    
    const query = `SELECT LONGITUDE, LATITUDE, ECO2, TVOC, ENTRY_TIME FROM ENTRY WHERE ID = ?`;

    // const query = `
    //               WITH GridEntries AS (
    //                   SELECT 
    //                       ID,
    //                       LONGITUDE,
    //                       LATITUDE,
    //                       ENTRY_TIME,
    //                       ECO2,
    //                       TVOC,
    //                       ROUND(LONGITUDE, 4) AS lon_grid,
    //                       ROUND(LATITUDE, 4) AS lat_grid,
    //                       ROW_NUMBER() OVER (
    //                           PARTITION BY ROUND(LONGITUDE, 4), ROUND(LATITUDE, 4) 
    //                           ORDER BY ENTRY_TIME DESC
    //                       ) AS rn
    //                   FROM ENTRY
    //               )
    //               SELECT 
    //                   ID, 
    //                   LONGITUDE, 
    //                   LATITUDE, 
    //                   ENTRY_TIME, 
    //                   ECO2, 
    //                   TVOC
    //               FROM GridEntries
    //               WHERE rn = 1;
    //               `;


    
    db.query(query, [userId], (err, rows) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database query failed" });
      }

      const transformedData = rows.map(row => ({
        latitude: row.LATITUDE,
        longitude: row.LONGITUDE,
        weight: calculateWeight(row.ECO2, row.TVOC), // Use ECO2 & TVOC as weight
        timestamp: row.ENTRY_TIME, // Include the timestamp
      }));
      

      res.json(transformedData);
      console.log("Retrieved Heatmap Data");
      console.log("Transformed Data:", transformedData.length);
    });

  } catch (err) {
    console.error("Unexpected server error:", err);
    res.status(500).json({ error: "Server error" });
  }

  
});

function calculateWeight(eco2, tvoc) {
  if (!eco2 || !tvoc) return 0.1*100; 
  return Math.max(1, (tvoc / 10) + (eco2 / 50)); // Scale appropriately -idk yet what to do for this
}


