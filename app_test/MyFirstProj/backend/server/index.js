const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());  // for parsing application/json

// Set up MySQL connection
const db = mysql.createConnection({
  host: '18.134.180.224',  
  user: 'remote_user',  
  password: 'Embedded2025!',
  database: 'DB2',
});

// Test DB connection
db.connect(err => {
  if (err) {
    console.log('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + db.threadId);
});

// Example route to query MySQL
app.get('/getData', (req, res) => {
  db.query('SELECT * FROM USER', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(results);
    }
  });
});


//login request
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  try {
    const query = 'SELECT ID, NAME, EMAIL, PASSWORD_HASH FROM USER WHERE EMAIL = ?';
    const [rows] = await db.promise().query(query, [email]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = rows[0];

    // password needs to be hashed at some point?
    if (password !== user.PASSWORD_HASH) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    res.status(200).json({
      id: user.ID,
      name: user.NAME,
      email: user.EMAIL,
    });

  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});



app.get('/user-data/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    
    const query = `SELECT LONGITUDE, LATITUDE, ECO2, TVOC FROM ENTRY WHERE ID = ?`;
    
    db.query(query, [userId], (err, rows) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database query failed" });
      }

      const transformedData = rows.map(row => ({
        latitude: row.LATITUDE,
        longitude: row.LONGITUDE,
        weight: calculateWeight(row.ECO2, row.TVOC), // Use ECO2 & TVOC as weight
      }));

      res.json(transformedData);
      console.log("Retrieved Heatmap Data");
    });

  } catch (err) {
    console.error("Unexpected server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

function calculateWeight(eco2, tvoc) {
  if (!eco2 || !tvoc) return 0.1; 
  return Math.min(1, (tvoc / 1000) + (eco2 / 5000)); // Scale appropriately
}


app.get('/user-data-by-email/:email', async (req, res) => {
  const userEmail = req.params.email;

  try {

    console.log(`Findung UserId for User: ${currentUser.email}`);

    //Find user ID from EMAIL
    const userQuery = `SELECT ID FROM USER WHERE EMAIL = ?`;
    db.query(userQuery, [userEmail], (err, userRows) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database query failed" });
      }
      if (userRows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const userId = userRows[0].ID; // Extract ID

      console.log(`Fetching heatmap data for user: ${userId}`);

      // Step 2: Fetch location data from ENTRY table
      const entryQuery = `SELECT LONGITUDE, LATITUDE, ECO2, TVOC FROM ENTRY WHERE ID = ?`;
      db.query(entryQuery, [userId], (err, rows) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Database query failed" });
        }

        const transformedData = rows.map(row => ({
          latitude: row.LATITUDE,
          longitude: row.LONGITUDE,
          weight: calculateWeight(row.ECO2, row.TVOC),
        }));

        res.json(transformedData);
        console.log("Retrieved Heatmap Data");

      });
    });

  } catch (err) {
    console.error("Unexpected server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post('/location', async (req, res) => {
  
  const { latitude, longitude, timestamp } = req.body;
  const formattedTimestamp = new Date(timestamp).toISOString().slice(0, 19).replace("T", " ");


  if ( !latitude || !longitude || !timestamp ) {
    return res.status(400).json({ error: 'Missing required data' });
  }

  const query = 'INSERT INTO ENTRY (ID, LONGITUDE, LATITUDE, ENTRY_TIME, ECO2, TVOC) VALUES (?, ?, ?, ?, NULL, NULL);';
  db.query(query, ['cyclist_001', longitude, latitude, formattedTimestamp], (err, results) => {
    if (err) {
      console.error('Error inserting location data:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    console.log('Location data inserted successfully');
    res.status(201).json({ message: 'Location data stored successfully' });
  });

});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${port}`);
});