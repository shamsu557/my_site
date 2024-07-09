const db = require('./mysql');

module.exports = function (app) {
    // Handle form submission
    app.post('/submit', (req, res) => {
        const { courseApplied, admissionNumber } = req.body;
        // Calculate first installment fee and school fee and determine duration based on the course applied
        let firstInstallmentFee = 0;
        let schoolFee = 0;
        let duration = '';
        switch (courseApplied.toLowerCase()) {
            case 'web development':
                firstInstallmentFee = 25000;
                schoolFee = 50000;
                duration = 'four months';
                break;
            case 'computer application':
                firstInstallmentFee = 10000;
                schoolFee = 20000;
                duration = 'six weeks';
                break;
            default:
                firstInstallmentFee = 0;
                schoolFee = 0;
                duration = 'to be determined';
                break;
        }
             
    });

    // Handle request to get student details
    app.get('/getStudentinfo', (req, res) => {
        const admissionNumber = req.query.admissionNumber;
        // Query the database to fetch student details based on the admission number
        const query = 'SELECT * FROM form_data WHERE admissionNumber = ?';
        db.query(query, [admissionNumber], (err, result) => {
            if (err) {
                console.error('Error fetching student details:', err);
                return res.status(500).send('An error occurred while fetching student details');
            }

            if (result.length === 1) {
                const studentDetails = result[0];
                let firstInstallmentFee = 0;
                let schoolFee = 0;
                switch (studentDetails.courseApplied.toLowerCase()) {
                    case 'web development':
                        schoolFee = 50000;
                        firstInstallmentFee= 100; 
                        break;
                    case 'computer application':
                        schoolFee = 20000;
                        firstInstallmentFee = 101; 
                        break;
                    default:
                        schoolFee = 0;
                        firstInstallmentFee = 0;
                        break;
                }
                studentDetails.schoolFee = schoolFee;
                studentDetails.firstInstallmentFee = firstInstallmentFee;
                res.json(studentDetails);
            } else {
                res.status(404).send('Student not found');
            }
        });
    });

    // Handle verification of payment
    app.get('/verifyPay', (req, res) => { // Changed endpoint to /verifyPay
        const firstPayreferenceNumber = req.query.reference;
        const emailAddress = req.query.email; // Email address used for payment
        const firstInstallmentFee = req.query.firstInstallmentFee;
        const firstName = req.query.firstName;

        // Retrieve admission number from the form_data table
        const getAdmissionNumberQuery = 'SELECT admissionNumber FROM form_data WHERE emailAddress = ?';
        db.query(getAdmissionNumberQuery, [emailAddress], (err, result) => {
            if (err) {
                console.error('Error fetching admission number:', err); // Log the error
                return res.status(500).send('An error occurred while verifying payment');
            }
            if (result.length === 1) {
                // Update the reference number, username, and password in the database for the corresponding payment
                const existingAdmissionNumber = result[0].admissionNumber; // Retrieve the admission number from the query result
                const updateQuery = 'UPDATE form_data SET firstPayreferenceNumber = ?, username = ?, password = ? WHERE admissionNumber = ?';
                db.query(updateQuery, [firstPayreferenceNumber, existingAdmissionNumber, existingAdmissionNumber, existingAdmissionNumber], (updateErr, updateResult) => {
                    if (updateErr) {
                        console.error('Error updating reference number in the database:', updateErr); // Log the error
                        return res.status(500).send('An error occurred while verifying payment');
                    }
                    if (updateResult.affectedRows === 1) {
                        const paymentMessage = `Dear ${firstName}, Your payment for the first installment fee  with reference number ${firstPayreferenceNumber}  has been verified successfully!. Please check your email for the payment receipt download. Kindly keep it for your records. Use your admission number ${existingAdmissionNumber} as username and password to login.`;
                        res.send(`
                            <!DOCTYPE html>
                            <html lang="en">
                            <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>Payment Verification</title>
                                <style>
                                    body {
                                        display: flex;
                                        justify-content: center;
                                        align-items: center;
                                        height: 100vh;
                                        margin: 0;
                                        text-align: center;
                                    }
                                    .successMessage {
                                        width: 80%;
                                        max-width: 600px;
                                        margin: auto;
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="successMessage">
                                    <p>${paymentMessage}</p>
                                    <p>Click <a href="/login">here</a> to proceed to login page.</p>
                                </div>
                            </body>
                            </html>
                        `);
                    } else {
                        res.status(404).send('Payment verification failed');
                    }
                });
            } else {
                res.status(404).send('Admission number not found');
            }
        });
    });
     // Handle login
     app.post('/login', (req, res) => {
        const { username, password } = req.body;
        // Query the database to check if the username and password are valid
        const query = 'SELECT * FROM form_data WHERE admissionNumber = ? AND password = ?';
        db.query(query, [username, password], (err, result) => {
            if (err) {
                console.error('Error during login:', err);
                return res.status(500).send('An error occurred during login');
            }

            if (result.length === 1) {
                // Successful login
                res.status(200).send(`Login successful`);
            } else {
                // Invalid credentials
                res.status(401).send('Invalid username or password');
            }
        });
    });
};
