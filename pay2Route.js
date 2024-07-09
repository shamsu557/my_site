const db = require('./mysql');

module.exports = function (app) {
    // Handle form submission
    app.post('/submit', (req, res) => {
        const { courseApplied, admissionNumber, secondPayreferenceNumber } = req.body;

        // Calculate first installment fee and school fee and determine duration based on the course applied
        const checkPaymentQuery = 'SELECT secondPayreferenceNumber FROM form_data WHERE admissionNumber = ?';
        db.query(checkPaymentQuery, [admissionNumber], (err, result) => {
            if (err) {
                console.error('Error checking payment:', err);
                return res.status(500).send('An error occurred while processing payment');
            }

            if (result.length > 0 && result[0].secondPayreferenceNumber) {
                return res.status(400).send('Payment already made for this admission number');
            } else {
                let secondInstallmentFee = 0;
                let schoolFee = 0;
                let duration = '';
                switch (courseApplied.toLowerCase()) {
                    case 'web development':
                        secondInstallmentFee = 110;
                        schoolFee = 220;
                        duration = 'four months';
                        break;
                    case 'computer application':
                        secondInstallmentFee = 100;
                        schoolFee = 200;
                        duration = 'six weeks';
                        break;
                    default:
                        secondInstallmentFee = 0;
                        schoolFee = 0;
                        duration = 'to be determined';
                        break;
                }

                // Insert secondPayreferenceNumber into form_data
                const updateReferenceQuery = 'UPDATE form_data SET secondPayreferenceNumber = ? WHERE admissionNumber = ?';
                db.query(updateReferenceQuery, [secondPayreferenceNumber, admissionNumber], (updateErr) => {
                    if (updateErr) {
                        console.error('Error updating reference number:', updateErr);
                        return res.status(500).send('An error occurred while updating reference number');
                    }

                    // Respond with a success message
                    res.send('Form submitted and reference number updated successfully!');
                });
            }
        });
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
                        schoolFee = 220;
                        secondInstallmentFee = 110;
                        break;
                    case 'computer application':
                        schoolFee = 200;
                        secondInstallmentFee = 100;
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
                // Update the reference nummber  in the database for the corresponding payment
                const presentAdmissionNumber = result[0].admissionNumber; // Retrieve the admission number from the query result
                const updateQuery = 'UPDATE form_data SET secondPayreferenceNumber = ? WHERE admissionNumber = ?';
                db.query(updateQuery, [secondPayreferenceNumber, presentAdmissionNumber], (updateErr, updateResult) => {
                    if (updateErr) {
                        console.error('Error updating reference number in the database:', updateErr); // Log the error
                        return res.status(500).send('An error occurred while verifying payment');
                    }
                    if (updateResult.affectedRows === 1) {
                        const payMessage = `Dear ${firstName}, Your payment for the second installment fee with reference number ${secondPayreferenceNumber} has been verified successfully! Please check your email for the payment receipt download. Kindly keep it for your records.`;
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
                                    <p>Click <a href="/">here</a> to proceed to login page.</p>
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
};
