const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
//const { AppOwnership } = require('expo-constants');

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
  user: 'remote_user',
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
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  try {
    const query = 'SELECT ID, NAME, EMAIL, PASSWORD_HASH FROM USER WHERE EMAIL = ?';
    
    db.query(query, [email], (err, rows) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ error: 'Database query failed' });
      }

      if (rows.length === 0) {
        return res.status(401).json({ error: 'User not found' });
      }

      const user = rows[0];

      // we need to actually hash passwords at some point lol
      if (password !== user.PASSWORD_HASH) {
        return res.status(401).json({ error: 'Invalid password' });
      }

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

//pair device 
app.post('/pair-device', async (req, res) => {
  const email = req.body.email;
  const deviceId = req.body.deviceId

  if (!email || !deviceId) {
    return res.status(400).json({ error: 'Missing email or device ID' });
  }

  try {
    //Get the existing user ID from the USER table
    const getUserQuery = 'SELECT ID FROM USER WHERE EMAIL = ?';

    db.query(getUserQuery, [email], (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ error: 'Database query failed' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const oldUserId = results[0].ID;

      //Temporarily disable foreign key checks
      const disableFKQuery = 'SET FOREIGN_KEY_CHECKS = 0;';
      db.query(disableFKQuery, (err) => {
        if (err) {
          console.error('Error disabling foreign key checks:', err);
          return res.status(500).json({ error: 'Database error' });
        }

        //Update the ID in the USER table
        const updateUserQuery = 'UPDATE USER SET ID = ? WHERE EMAIL = ?';
        db.query(updateUserQuery, [deviceId, email], (err) => {
          if (err) {
            console.error('Error updating USER table:', err);
            return res.status(500).json({ error: 'Database error' });
          }

          //Update the ID in the ENTRY table
          const updateEntryQuery = 'UPDATE ENTRY SET ID = ? WHERE ID = ?';
          db.query(updateEntryQuery, [deviceId, oldUserId], (err) => {
            if (err) {
              console.error('Error updating ENTRY table:', err);
              return res.status(500).json({ error: 'Database error' });
            }

            //Re-enable foreign key checks
            const enableFKQuery = 'SET FOREIGN_KEY_CHECKS = 1;';
            db.query(enableFKQuery, (err) => {
              if (err) {
                console.error('Error enabling foreign key checks:', err);
                return res.status(500).json({ error: 'Database error' });
              }

              console.log('Device ID updated successfully in both tables');
              res.status(200).json({ message: 'Device ID updated successfully' });
            });
          });
        });
      });
    });

  } catch (err) {
    console.error('Unexpected server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

//retreive all user's datapoints including eco2 and tvoc values
app.get('/user-data/:email', async (req, res) => {
  const email = req.params.email;

  try {
    
    const getUserQuery = 'SELECT ID FROM USER WHERE EMAIL = ?';

    db.query(getUserQuery, [email], (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ error: 'Database query failed' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userId = results[0].ID;

      // Step 2: Retrieve all data points for the user from ENTRY table
      const getDataQuery = `
        SELECT LATITUDE, LONGITUDE, ECO2, TVOC, ENTRY_TIME 
        FROM ENTRY 
        WHERE ID = ?
      `;

      db.query(getDataQuery, [userId], (err, dataResults) => {
        if (err) {
          console.error('Database query error:', err);
          return res.status(500).json({ error: 'Database query failed' });
        }

        // Transform data into required format
        const formattedData = dataResults.map(row => ({
          coordinate: { latitude: row.LATITUDE, longitude: row.LONGITUDE },
          eco2: row.ECO2,
          tvoc: row.TVOC,
          date: row.ENTRY_TIME
        }));

        console.log(`Retrieved ${formattedData.length} data points for user ${email}`);
        res.status(200).json(formattedData);
      });
    });

  } catch (error) {
    console.error("Unexpected server error:", error);
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


