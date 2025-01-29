const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());  // for parsing application/json

// Set up MySQL connection
const db = mysql.createConnection({
  host: '18.134.180.224',  // e.g., 'localhost'
  user: 'remote_user',  // e.g., 'root'
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

app.post('/location', async (req, res) => {
  
  const { latitude, longitude, timestamp } = req.body;

  
  if ( !latitude || !longitude || !timestamp ) {
    return res.status(400).json({ error: 'Missing required data' });
  }
  const query = 'INSERT INTO ENTRY (ID, LONGITUDE, LATITUDE, ENTRY_TIME, ECO2, TVOC) VALUES (?, ?, ?, ?, NULL, NULL);';
  db.query(query, ['cyclist_001', longitude, latitude, timestamp], (err, results) => {
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