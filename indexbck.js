$(document).ready(function() {
    // Initially hide the security answer container
    $('#securityAnswerContainer').hide();

    // Show/hide security answer container based on security question selection
    $('#securityQuestion').change(function() {
        if ($(this).val()) {
            $('#securityAnswerContainer').show();
        } else {
            $('#securityAnswerContainer').hide();
        }
    });

    // Function to handle click event for View Application button
    $('#viewButton').click(function() {
        // Hide the application form and show the application details
        $('#applicationForm').hide();
        $('#applicationDetails').show();

        // Trim and convert security answer to uppercase
        var trimmedSecurityAnswer = $('#securityAnswer').val().trim().toUpperCase();

        // Gather data from the form
        var applicationDetails = `
            <p><strong>Surname:</strong> ${$('#surname').val()}</p>
            <p><strong>First Name:</strong> ${$('#firstName').val()}</p>
            <p><strong>Last Name:</strong> ${$('#lastName').val()}</p>
            <p><strong>Address:</strong> ${$('#address').val()}</p>
            <p><strong>Email Address:</strong> ${$('#emailAddress').val()}</p>
            <p><strong>Phone Number:</strong> ${$('#phoneNumber').val()}</p>
            <p><strong>Date of Birth:</strong> ${$('#dob').val()}</p>
            <p><strong>Country:</strong> ${$('#country').val()}</p>
            <p><strong>State:</strong> ${$('#state').val()}</p>
            <p><strong>Local Government:</strong> ${$('#localGovernment').val()}</p>
            <p><strong>Security Question:</strong> ${$('#securityQuestion').val()}</p>
            <p><strong>Security Answer:</strong> ${trimmedSecurityAnswer}</p> <!-- Updated with trimmed and uppercase answer -->
            <p><strong>Highest Qualification:</strong> ${$('#highestQualification').val()}</p>
            <p><strong>Course Applied:</strong> ${$('#courseApplied').val()}</p>
            <p><strong>Computer Literacy Level:</strong> ${$('#computerLiteracyLevel').val()}</p>
            <button type="button" id="okButton" class="btn btn-primary">OK</button>
            <button type="button" id="detailsEditButton" class="btn btn-warning">Edit Application</button>
        `;

        // Display the application details
        $('#detailsContent').html(applicationDetails);

        // Function to handle click event for OK button
        $('#okButton').click(function() {
            $('#applicationForm :input').prop('disabled', false);
            $('#applicationDetails').hide();
            $('#applicationForm').show();
            $('#viewButton').show();
            $('#editButton').hide();
            $('#submitButton').show();
        });

        // Function to handle click event for Edit Application button in details
        $('#detailsEditButton').click(function() {
            $('#applicationForm :input').prop('disabled', false);
            $('#applicationDetails').hide();
            $('#applicationForm').show();
            $('#viewButton').show();
            $('#editButton').hide();
            $('#submitButton').show();
        });
    });

    // Function to handle click event for Edit Application button
    $('#editButton').click(function() {
        // Enable form fields
        $('#applicationForm :input').prop('disabled', false);

        // Show the View and Submit buttons, hide the Edit button
        $('#editButton').hide();
        $('#viewButton').show();
        $('#submitButton').show();
    });

    // Handle form submission to get student details for schoolfeee payment
    $('#getAdmissionDetailsForm').submit(function(e) {
        e.preventDefault();
        var admissionNumber = $('#admissionNumber').val();
        if (!admissionNumber) {
            alert("Please enter the admission number.");
            return;
        }

        // Submit admission details form
        $.get('/getStudentDetails', { admissionNumber: admissionNumber }, function(data) {
            var studentDetails = '<p>Student Details:</p><p>Name: ' + data.firstName + ' ' + data.surname + ' ';
            if (data.lastName) {
                studentDetails += data.lastName;
            }
            studentDetails += '</p><p>Email Address: ' + data.emailAddress + '</p><p>Local Government: ' + data.localGovernment +  '</p><p>Admission Number: ' + data.admissionNumber +'</p><p>State: ' + data.state +  '</p><p>Computer Lietracy Level: ' + data.computerLiteracyLevel +  '</p><p>Country: ' + data.country+  '</p><p>Course Applied: ' + data.courseApplied + '</p><p>School Fee: NGN' + data.schoolFee + '</p>';
            $('#studentDetails').html(studentDetails);
            $('#admissionNumberPayment').val(admissionNumber);
            $('#first-name').val(data.firstName); // Populate first name input
            $('#last-name').val(data.surname); // Populate last name input
            $('#email-address-payment').val(data.emailAddress); // Populate email address input
        }).fail(function() {
            $('#studentDetails').html('<p class="text-danger">Student not found!</p>');
            $('#makeAdmissionPaymentForm').hide(); // Hide proceed to payment form if student not found
        });
    });

    // Function to initiate payment with Paystack
    function payWithPaystack(reference, emailAddress) {
        let handler = PaystackPop.setup({
            key: 'pk_live_e6942e61f70c87019cbeb64ffed04e10fbd2ee10', // Replace with your public key
            email: emailAddress,
            amount: document.getElementById("amount").value * 100,
            ref: '' + Math.floor((Math.random() * 1000000000) + 1),
            onClose: function() {
                alert('Window closed.');
            },
            callback: function(response) {
                handlePaymentResponse(response.reference);
            }
        });

        handler.openIframe();
    }

    // Function to handle payment response
    function handlePaymentResponse(reference) {
        let message = 'Payment complete! Reference: ' + reference;
        alert(message);


        // Display message with link to verify payment on the server side
        let verificationMessage = 'Click OK to verify your payment.';
        if (confirm(verificationMessage)) {
            let emailAddress = $('#email-address-payment').val(); // Get the email address used for payment
            let firstName = $('#first-name').val(); // Get the first name
            let applicationNumber = $('#applicationNumberPayment').val(); // Get the application number
            let admissionNumber = $('#admissionNumberPayment').val(); // Get the admission number
            let applicationFee = $('#amount').val(); // Get the application fee
            window.location.href = '/verifyPayment?reference=' + reference + '&email=' + encodeURIComponent(emailAddress) + '&firstName=' + encodeURIComponent(firstName) + '&applicationFee=' + encodeURIComponent(applicationFee) + '&applicationNumber=' + encodeURIComponent(applicationNumber) + '&admissionNumber=' + encodeURIComponent(admissionNumber);
        }
    }

    $(document).ready(function() {
        // Preview uploaded image
        $('#profilePicture').change(function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    $('#previewProfilePicture').attr('src', e.target.result);
                    $('#previewProfilePicture').show(); // Show preview image
                }
                reader.readAsDataURL(file);
            }
        });
    });
    // Navbar dropdown functionality (unchanged)
    $('.nav-item.dropdown').hover(function() {
        // Show current dropdown
        $(this).find('.dropdown-menu').show();
        // Close other dropdowns
        $('.nav-item.dropdown').not(this).find('.dropdown-menu').hide();
    });

    // Close dropdown when clicking outside of it or hovering over another navbar item (unchanged)
    $(document).on('click mouseenter', function(e) {
        if (!$(e.target).closest('.nav-item.dropdown').length) {
            $('.dropdown-menu').hide();
        }
    });

    // Scroll to top button (unchanged)
    let mybutton = document.getElementById("myBtn");
    window.onscroll = function() {
        scrollFunction();
    };

    function scrollFunction() {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            mybutton.style.display = "block";
        } else {
            mybutton.style.display = "none";
        }
    }

    // Function to scroll to top when the button is clicked (unchanged)
    $('#myBtn').click(function() {
        $('html, body').animate({ scrollTop: 0 }, 'fast');
        return false;
    });
});