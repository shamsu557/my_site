$(document).ready(function () {
  // Show the forgot password form
  $('#forgotPasswordBtn').click(function () {
      $('#loginForm').hide();
      $('#forgotPasswordForm').show();
  });

  // Check if username exists in the database
  $('#checkUsernameBtn').click(function () {
      var username = $('#fpUsername').val();

      $.ajax({
          url: '/check-username',
          type: 'POST',
          data: JSON.stringify({ username: username }),
          contentType: 'application/json',
          success: function (response) {
              if (response.success) {
                  $('#forgotPasswordForm').hide();
                  $('#securityQuestionLabel').text(response.securityQuestion);
                  $('#securityQuestionForm').show();
              } else {
                  alert(response.message || 'Username not found');
              }
          },
          error: function (xhr, status, error) {
              console.error('Error while checking username:', error);
              alert('Error while checking username');
          }
      });
  });

  // Check if the answer to the security question is correct
  $('#checkAnswerBtn').click(function () {
      var username = $('#fpUsername').val();
      var answer = $('#securityAnswer').val().trim().toUpperCase();

      $.ajax({
          url: '/check-answer',
          type: 'POST',
          data: JSON.stringify({ username: username, answer: answer }),
          contentType: 'application/json',
          success: function (response) {
              if (response.success) {
                  $('#securityQuestionForm').hide();
                  $('#changePasswordForm').show();
              } else {
                  alert(response.message || 'Incorrect answer to the security question');
              }
          },
          error: function (xhr, status, error) {
              console.error('Error while checking security answer:', error);
              alert('Error while checking security answer');
          }
      });
  });

  // Change the password
  $('#changePasswordBtn').click(function () {
      var username = $('#fpUsername').val();
      var newPassword = $('#newPassword').val();
      var confirmPassword = $('#confirmPassword').val();

      if (newPassword !== confirmPassword) {
          alert('Passwords do not match.');
          return;
      }

      $.ajax({
          url: '/change-password',
          type: 'POST',
          data: JSON.stringify({ username: username, newPassword: newPassword }),
          contentType: 'application/json',
          success: function (response) {
              if (response.success) {
                  alert('Password changed successfully');
                  $('#changePasswordForm').hide();
                  $('#loginForm').show();
              } else {
                  alert(response.message || 'Error while changing the password');
              }
          },
          error: function (xhr, status, error) {
              console.error('Error while changing password:', error);
              alert('Error while changing password');
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