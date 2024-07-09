 // Handle request to get student details for school fees payment
 app.get('/getStudentDetails', (req, res) => {
    const applicationsNumber = req.query.admissionNumber;
    
    // Query the database to fetch student details based on the admission number and payment number
    const query = 'SELECT * FROM form_data WHERE admissionNumber = ?';
    db.query(query, [applicationsNumber], (err, result) => {
        if (err) {
            console.error('Error fetching student details:', err);
            return res.status(500).send('An error occurred while fetching student details');
        }

        if (result.length === 1) {
            const studentDetails = result[0];
            // Determine the school fee based on the course applied and payment number
            let schoolFee = 0;
            if (studentDetails.courseApplied === "Web Development") {
                schoolFee = paymentNumber === "1" ? 25000 : 25000; // First and second installment amount for Web Development
            } else if (studentDetails.courseApplied === "Computer Application ") {
                schoolFee = paymentNumber === "1" ? 10000 : 10000; // First and second installment amount for Computer Application 
            }
            studentDetails.schoolFee = schoolFee;
            res.json(studentDetails);
        } else {
            res.status(404).send('Student not found');
        }
    });
});
// Handle request to get student details for school fees payment
app.get('/getStudentDetails', (req, res) => {
    const admissionNumber = req.query.admissionNumber;
    const paymentNumber = req.query.paymentNumber;

    // Query the database to fetch student details based on the admission number
    const query = 'SELECT * FROM student_data WHERE admissionNumber = ?';
    db.query(query, [admissionNumber], (err, result) => {
        if (err) {
            console.error('Error fetching student details:', err);
            return res.status(500).send('An error occurred while fetching student details');
        }

        if (result.length === 1) {
            const studentDetails = result[0];
            // Determine the school fee based on the course applied and payment number
            let schoolFee = 0;
            if (studentDetails.courseApplied === "Web Development") {
                schoolFee = paymentNumber === "1" ? 25000 : 25000; // First and second installment amount for Web Development
            } else if (studentDetails.courseApplied === "Computer Application ") {
                schoolFee = paymentNumber === "1" ? 10000 : 10000; // First and second installment amount for Computer Application 
            }
            
            // Check if the first payment has been made before allowing the second payment
            if (paymentNumber === "2" && !studentDetails.firstPaymentMade) {
                return res.status(400).send('First payment has not been made. Please make the first payment before proceeding to the second.');
            }

            studentDetails.schoolFee = schoolFee;
            studentDetails.paymentNumber = paymentNumber; // Include paymentNumber in the response
            res.json(studentDetails);
        } else {
            res.status(404).send('Student not found');
        }
    });
});

// Handle verification of payment for school fees
app.get('/verifyPayment', (req, res) => {
    const referenceNumber = req.query.reference;
    const emailAddress = req.query.email; // Email address used for payment
    const firstName = req.query.firstName;
    const admissionNumber = req.query.admissionNumber;
    const schoolFee = req.query.schoolFee;
    const paymentNumber = req.query.paymentNumber;

    // Query the database to verify payment based on the reference number and admission number
    const query = 'SELECT * FROM payments WHERE referenceNumber = ? AND admissionNumber = ?';
    db.query(query, [referenceNumber, admissionNumber], (err, result) => {
        if (err) {
            console.error('Error verifying payment:', err);
            return res.status(500).send('An error occurred while verifying payment');
        }

        if (result.length === 1) {
            // Payment is verified
            const paymentDetails = result[0];

            // Update form_data table with username and password for login
            const updateQuery = 'UPDATE form_data SET username = ?, password = ? WHERE admissionNumber = ?';
            // Set username and password as admissionNumber
            const username = admissionNumber;
            const password = admissionNumber; // Set password same as username (admission number)
            db.query(updateQuery, [username, password, admissionNumber], (err, result) => {
                if (err) {
                    console.error('Error updating form_data table:', err);
                    return res.status(500).send('An error occurred while updating form_data table');
                }

                // Update reference numbers based on paymentNumber
                let updateRefQuery = '';
                if (paymentNumber === "1") {
                    updateRefQuery = 'UPDATE form_data SET firstPayreferenceNumber = ? WHERE admissionNumber = ?';
                } else if (paymentNumber === "2") {
                    updateRefQuery = 'UPDATE form_data SET secondPayreferenceNumber = ? WHERE admissionNumber = ?';
                }

                db.query(updateRefQuery, [referenceNumber, admissionNumber], (err, result) => {
                    if (err) {
                        console.error('Error updating reference numbers:', err);
                        return res.status(500).send('An error occurred while updating reference numbers');
                    }

                    // Send response with success message and instructions for login
                    const successMessage = `Payment verified successfully for ${firstName}. Use your admission number (${admissionNumber}) as both username and password to login.`;
                    res.send(successMessage);
                });
            });
        } else {
            // Payment not found
            res.status(404).send('Payment not found or not associated with the given admission number.');
        }
    });
});