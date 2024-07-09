const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('./mysql'); // Assuming you have MySQL connection configured
const multer = require('multer');
const routes = require('./routes');
const secondPaymntRoute = require('./pay2Route');
const firstPayRoute = require('./pay1Route');
const fs = require('fs');
const app = express();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './'); // Destination folder where files will be uploaded
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // File naming convention
  }
});

const upload = multer({ storage: storage });

// Middleware to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the root directory
app.use(express.static(__dirname));

// Serve HTML files
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'dashboard.html')));
app.get('/app_payment', (req, res) => res.sendFile(path.join(__dirname, 'app_payment.html')));
app.get('/firstPay', (req, res) => res.sendFile(path.join(__dirname, 'firstPay.html')));
app.get('/secondPay', (req, res) => res.sendFile(path.join(__dirname, 'secondPay.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/firstTest', (req, res) => res.sendFile(path.join(__dirname, 'firstTest.html')));
app.get('/secondTest', (req, res) => res.sendFile(path.join(__dirname, 'secondTest.html')));


// Route to fetch student details
app.get('/populateStudentDetails', (req, res) => {
  const admissionNumber = req.query.admissionNumber;
  const sql = 'SELECT firstName, lastName, courseApplied, admissionNumber, emailAddress, profile_picture_url FROM form_data WHERE admissionNumber = ?';
  mysql.query(sql, [admissionNumber], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    if (result.length === 0) {
      res.status(404).json({ error: 'Student not found' });
    } else {
      res.json(result[0]);
    }
  });
});

// Route to handle profile picture upload
app.post('/uploadProfilePicture', upload.single('profilePicture'), (req, res) => {
  const admissionNumber = req.body.admissionNumber;
  const profilePicturePath = req.file.path;

  // Check if profile picture already exists for this student
  const checkSql = 'SELECT profile_picture_url FROM form_data WHERE admissionNumber = ?';
  mysql.query(checkSql, [admissionNumber], (err, result) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (result.length > 0 && result[0].profile_picture_url) {
      // Profile picture already exists, return an error
      return res.status(409).json({ error: 'Profile picture already uploaded. Cannot upload again.' });
    }

    // Proceed with updating the profile picture URL
    const updateSql = 'UPDATE form_data SET profile_picture_url = ? WHERE admissionNumber = ?';
    mysql.query(updateSql, [profilePicturePath, admissionNumber], (err, result) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.json({ imageUrl: '/' + profilePicturePath });
    });
  });
});

// Use routes defined and pass the upload instance
routes(app);
secondPaymntRoute(app);
firstPayRoute(app);
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
