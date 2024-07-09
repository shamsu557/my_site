const db = require('./mysql');

module.exports = function (app) {
    // Handle form submission
    app.post('/submit', (req, res) => {
        const { courseApplied, admissionNumber } = req.body;
        // Calculate first installment fee and school fee and determine duration based on the course applied
        let secondInstallmentFee = 0;
        let schoolFee = 0;
        let duration = '';
        switch (courseApplied.toLowerCase()) {
            case 'web development':
                secondInstallmentFee = 25000;
                schoolFee = 50000;
                duration = 'four months';
                break;
            case 'computer application':
                secondInstallmentFee = 10000;
                schoolFee = 20000;
                duration = 'six weeks';
                break;
            default:
                secondInstallmentFee = 0;
                schoolFee = 0;
                duration = 'to be determined';
                break;
        }
             
    });

    // Handle request to get student details
    app.get('/getStudentRecord', (req, res) => {
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
                let secondInstallmentFee = 0;
                let schoolFee = 0;
                switch (studentDetails.courseApplied.toLowerCase()) {
                    case 'web development':
                        schoolFee = 50000;
                        secondInstallmentFee= 100; 
                        break;
                    case 'computer application':
                        schoolFee = 20000;
                        secondInstallmentFee = 101; 
                        break;
                    default:
                        schoolFee = 0;
                        secondInstallmentFee = 0;
                        break;
                }
                studentDetails.schoolFee = schoolFee;
                studentDetails.secondInstallmentFee = secondInstallmentFee;
                res.json(studentDetails);
            } else {
                res.status(404).send('Student not found');
            }
        });
    });

    // Handle verification of payment
    app.get('/Payment', (req, res) => { // Changed endpoint to /verifyPay
        const secondPayreferenceNumber = req.query.reference;
        const emailAddress = req.query.email; // Email address used for payment
        const secondInstallmentFee = req.query.secondInstallmentFee;
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
                const presentAdmissionNumber = result[0].admissionNumber; // Retrieve the admission number from the query result
                const updateQuery = 'UPDATE form_data SET secondPayreferenceNumber = ? WHERE admissionNumber = ?';
                db.query(updateQuery, [secondPayreferenceNumber, presentAdmissionNumber], (updateErr, updateResult) => {
                    if (updateErr) {
                        console.error('Error updating reference number in the database:', updateErr); // Log the error
                        return res.status(500).send('An error occurred while verifying payment');
                    }
                    if (updateResult.affectedRows === 1) {
                        const payMessage = `Dear ${firstName}, Your payment for the second installment fee  with reference number ${secondPayreferenceNumber}  has been verified successfully!.`;
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
                                    <p>${payMessage}</p>
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
