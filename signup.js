document.getElementById('signupForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent the form from submitting the default way

  const formData = new FormData(this);
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');

  // Validate that passwords match
  if (password !== confirmPassword) {
      document.getElementById('responseMessage').innerHTML = `<div class="alert alert-danger" role="alert">Passwords do not match.</div>`;
      return;
  }

  // Convert security answer to uppercase
  formData.set('security_answer', formData.get('security_answer').toUpperCase());

  // Send the form data, including the profile picture
  fetch('/signup_staff', {
      method: 'POST',
      body: formData,
  })
  .then(response => response.text())
.then(result => {
    document.getElementById('responseMessage').innerHTML = `<div class="alert alert-success" role="alert">${result}</div>`;
    if (result.includes('successfully')) {
        alert(result); // Show an alert dialog with the result
        window.location.href = 'slogin.html'; // Redirect to login page after "OK" is clicked
    }
})

  .catch(error => {
      console.error('Error:', error);
      document.getElementById('responseMessage').innerHTML = `<div class="alert alert-danger" role="alert">An error occurred: ${error.message}</div>`;
  });
});