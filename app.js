const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const mysql = require('./mysql'); // Ensure this path is correct
const multer = require('multer');
const routes = require('./routes');
const secondPaymntRoute = require('./pay2Route');
const firstPayRoute = require('./pay1Route');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const app = express();

app.use(session({
    secret: 'YBdLcGmLbdsYrw9S4PNnaCW3SuHhZ6M0', // Replace with your own secret
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Multer storage configuration for profile pictures
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './'); // Destination folder for profile pictures
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
app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});
app.get('/app_payment', (req, res) => res.sendFile(path.join(__dirname, 'app_payment.html')));
app.get('/firstPay', (req, res) => res.sendFile(path.join(__dirname, 'firstPay.html')));
app.get('/secondPay', (req, res) => res.sendFile(path.join(__dirname, 'secondPay.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/firstTest', (req, res) => res.sendFile(path.join(__dirname, 'firstTest.html')));
app.get('/secondTest', (req, res) => res.sendFile(path.join(__dirname, 'secondTest.html')));
app.get('/upload', (req, res) => res.sendFile(path.join(__dirname, 'upload.html')));
app.get('/apply', (req, res) => res.sendFile(path.join(__dirname, 'apply.html')));
app.get('/staff', (req, res) => res.sendFile(path.join(__dirname, 'slogin.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'signup.html')));

// Endpoint to handle staff login
app.post('/staffLogin', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM staff_data WHERE (username = ? OR email = ?) AND password = ?';
    mysql.query(query, [username, username, password], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            res.status(500).json({ success: false, message: 'Internal server error' });
            return;
        }

        if (results.length > 0) {
            req.session.loggedin = true;
            req.session.staff = results[0];
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    });
});

// Endpoint to handle file uploads for credentials
app.post('/upload_credentials', upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'primaryCertificate', maxCount: 1 },
    { name: 'higherInstitutionCertificate', maxCount: 1 },
    { name: 'computerCertificate', maxCount: 1 }
]), (req, res) => {
    const applicationNumber = req.body.applicationNumber;
    const profilePicture = req.files['profilePicture'] ? req.files['profilePicture'][0].path : null;
    const primaryCertificate = req.files['primaryCertificate'] ? req.files['primaryCertificate'][0].path : null;
    const higherInstitutionCertificate = req.files['higherInstitutionCertificate'] ? req.files['higherInstitutionCertificate'][0].path : null;
    const computerCertificate = req.files['computerCertificate'] ? req.files['computerCertificate'][0].path : null;

    if (!profilePicture || !primaryCertificate) {
        return res.status(400).json({ success: false, message: 'Required files not uploaded' });
    }

    const sql = `UPDATE form_data SET profile_picture_url = ?, primaryCertificate = ?, higherInstitutionCertificate = ?, computerCertificate = ? WHERE applicationNumber = ?`;
    const values = [profilePicture, primaryCertificate, higherInstitutionCertificate, computerCertificate, applicationNumber];

    mysql.query(sql, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Database error' });
        } else {
            res.redirect(`/upload_success/${applicationNumber}`);
        }
    });
});

// Serve the upload success page
app.get('/upload_success/:applicationNumber', (req, res) => {
    const applicationNumber = req.params.applicationNumber;
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Upload Successful</title>
            <style>
                body {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    text-align: center;
                }
                .message {
                    width: 80%;
                    max-width: 600px;
                    margin: auto;
                }
            </style>
        </head>
        <body>
            <div class="message">
                <p>Your files have been uploaded successfully.</p>
                <p>Click <a href="/application_form/${applicationNumber}" target="_blank">here</a> to download or print your application form.</p>
                <p>Click continue to proceed to payment of application Fee</p>
                <form action="/app_payment" method="GET">
                    <input type="hidden" name="applicationNumber" value="${applicationNumber}">
                    <button type="submit">Continue</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

// Handle profile picture upload for staff
app.post('/updateProfilePic', upload.single('profilePic'), (req, res) => {
    if (!req.session.loggedin) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const profilePicPath = `/profile_pics/${req.file.filename}`;
    const query = 'UPDATE staff_data SET profile_picture = ? WHERE id = ?';

    mysql.query(query, [profilePicPath, req.session.staff.id], (err, results) => {
        if (err) throw err;
        req.session.staff.profile_picture = profilePicPath;
        res.json({ success: true, profilePicPath });
    });
});

// Serve the staff dashboard
app.get('/staff_dashboard', (req, res) => {
    if (!req.session.loggedin) {
        return res.redirect('/slogin.html');
    }
    res.sendFile(path.join(__dirname, 'staff_dashboard.html'));
});

// Check session for staff
app.get('/session', (req, res) => {
    if (req.session.loggedin) {
        res.json({ loggedin: true, staff: req.session.staff });
    } else {
        res.json({ loggedin: false });
    }
});

// Handle logout
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('An error occurred while logging out');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

// Check session for user
app.get('/checkSession', (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true });
    } else {
        res.json({ loggedIn: false });
    }
});



// Use routes defined and pass the upload instance
routes(app);
secondPaymntRoute(app);
firstPayRoute(app);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
