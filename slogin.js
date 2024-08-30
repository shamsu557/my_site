// Handle login form submission
document.getElementById("loginForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch("/staffLogin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      window.location.href = "staff_dashboard.html";
    } else {
      alert("Invalid username or password");
    }
  })
  .catch(error => {
    console.error("Error:", error);
    alert("An error occurred. Please try again later.");
  });
});

// Show forgot password form
document.getElementById("forgotPasswordLink").addEventListener("click", function(event) {
  event.preventDefault();
  document.getElementById("loginFormContainer").style.display = "none";
  document.getElementById("forgotPasswordForm").style.display = "block";
});

// Handle forgot password form submission
document.getElementById("forgotPasswordFormInner").addEventListener("submit", function(event) {
  event.preventDefault();

  const usernameOrId = document.getElementById("usernameOrId").value;

  fetch("/forgotPassword", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ usernameOrId })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      document.getElementById("forgotPasswordForm").style.display = "none";
      document.getElementById("resetPasswordForm").style.display = "block";
      document.getElementById("securityQuestion").value = data.securityQuestion;
    } else {
      alert("Username or Staff ID not found");
    }
  })
  .catch(error => {
    console.error("Error:", error);
    alert("An error occurred. Please try again later.");
  });
});

// Handle reset password form submission
document.getElementById("resetPasswordFormInner").addEventListener("submit", function(event) {
  event.preventDefault();

  const securityAnswer = document.getElementById("securityAnswer").value.toUpperCase().trim();
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (newPassword !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  fetch("/resetPassword", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ securityAnswer, newPassword })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      alert("Password reset successfully. You can now log in with your new password.");
      window.location.href = "slogin.html"; // Redirect to login page
    } else {
      alert("Security answer is incorrect or an error occurred.");
    }
  })
  .catch(error => {
    console.error("Error:", error);
    alert("An error occurred. Please try again later.");
  });
});

// Go back to login form
document.getElementById("backToLoginLink").addEventListener("click", function(event) {
  event.preventDefault();
  document.getElementById("forgotPasswordForm").style.display = "none";
  document.getElementById("loginFormContainer").style.display = "block";
});
