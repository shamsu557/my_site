document.addEventListener('DOMContentLoaded', function() {
  const emailCheckForm = document.getElementById('emailCheckFormInner');
  const signupForm = document.getElementById('signupFormInner');

  // Handle email check form submission
  emailCheckForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const email = this.querySelector('#email').value;

    // Perform backend check to see if email exists in staff table
    checkEmailExists(email)
      .then(response => {
        if (!response.exists) {
          alert('Email does not exist in staff records. Staff not eligible.');
        } else {
          document.getElementById('emailHidden').value = email;
          document.getElementById('emailCheckForm').style.display = 'none';
          document.getElementById('signupForm').style.display = 'block';
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
      });
  });

  // Handle signup form submission
  signupForm.addEventListener('submit', function(event) {
    event.preventDefault();

    // Fetch form data
    const formData = new FormData(signupForm);
    
    // Validate required fields
    const requiredFields = ['email', 'firstname', 'surname', 'lastname', 'securityQuestion', 'securityAnswer', 'username', 'password', 'confirmPassword', 'staffPic'];
    const isValid = requiredFields.every(field => formData.get(field));

    if (!isValid) {
      alert('Please fill out all required fields.');
      return;
    }

    // Check if password and confirmPassword match
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    // Convert security answer to uppercase and trim spaces
    const securityAnswer = formData.get('securityAnswer').trim().toUpperCase();
    formData.set('securityAnswer', securityAnswer);

    // Check if phoneNumber field is provided
    const phoneNumber = formData.get('phoneNumber');
    if (phoneNumber) {
      alert('Staff with phone number already registered. Please proceed to login.');
      return;
    }

    // Submit the form data to server for staff signup
    fetch('/staffSignup', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Staff member signed up successfully!');
        signupForm.reset();
        document.getElementById('emailCheckForm').style.display = 'block';
        document.getElementById('signupForm').style.display = 'none';
      } else {
        alert('Signup failed. Please try again later.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred while signing up.');
    });
  });

  // Function to check if email exists in staff table
  function checkEmailExists(email) {
    return fetch(`/checkStaffEmail?email=${email}`)
      .then(response => response.json());
  }
});
