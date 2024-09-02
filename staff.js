$(document).ready(function () {
    const signupForm = $('#signupForm');

    // Initially, disable the form fields
    signupForm.find(':input').prop('disabled', true);

    // View Button: Show the details
    $('#viewButton').click(function (event) {
        event.preventDefault();
        const formData = getFormData();
        const applicationDetails = formatApplicationDetails(formData);

        // Display the application details
        alert("Sign Up Details:\n" + applicationDetails);

        // Show the form with fields disabled and toggle button visibility
        signupForm.find(':input').prop('disabled', true);
        $('#viewButton').hide();
        $('#editButton').show();
        $('#submitButton').show();
    });

    // Edit Button: Enable form fields for editing
    $('#editButton').click(function () {
        signupForm.find(':input').prop('disabled', false);

        // Hide Edit button, show View and Submit buttons
        $('#editButton').hide();
        $('#viewButton').show();
        $('#submitButton').show();
    });

    // Submit Button: Validate and submit the form
    $('#submitButton').click(function (event) {
        event.preventDefault();

        // Perform all necessary validations here
        const formData = getFormData();

        if (formData.password !== formData.confirm_password) {
            alert("Passwords do not match.");
            return;
        }

        formData.highest_qualification = capitalizeWords(formData.highest_qualification);
        formData.specialization = capitalizeWords(formData.specialization);
        formData.security_answer = formData.security_answer.toUpperCase();

        // Simulate server request to check if email exists
        checkEmailExists(formData.email)
            .then(emailExists => {
                if (!emailExists) {
                    alert("The email address does not exist in the staff records.");
                } else {
                    // Simulate form data submission to the server
                    submitFormData(formData)
                        .then(response => {
                            if (response.success) {
                                alert("Staff details updated successfully.");
                            } else {
                                alert("Error updating staff details.");
                            }
                        })
                        .catch(error => {
                            console.error("Error submitting form:", error);
                        });
                }
            })
            .catch(error => {
                console.error("Error checking email:", error);
            });
    });

    function getFormData() {
        const formData = signupForm.serializeArray();
        const dataObject = {};
        formData.forEach(field => {
            dataObject[field.name] = field.value;
        });
        return dataObject;
    }

    function formatApplicationDetails(formData) {
        return `
            First Name: ${formData.firstname}\n
            Last Name: ${formData.lastname}\n
            Surname: ${formData.surname}\n
            Username: ${formData.username}\n
            Phone Number: ${formData.phoneNumber}\n
            Email: ${formData.email}\n
            Highest Qualification: ${formData.highest_qualification}\n
            Specialization: ${formData.specialization}\n
            Position: ${formData.position}\n
            Security Question: ${formData.security_question}\n
            Security Answer: ${formData.security_answer}
        `;
    }

    function capitalizeWords(str) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    function checkEmailExists(email) {
        // This function should call the server to check if the email exists
        // For demonstration, it always returns true
        return new Promise((resolve) => {
            // Simulate server request with setTimeout
            setTimeout(() => {
                resolve(true); // Change this based on server response
            }, 500);
        });
    }

    function submitFormData(formData) {
        // Simulate server submission
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true });
            }, 1000);
        });
    }
});
