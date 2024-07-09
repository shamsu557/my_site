document.addEventListener("DOMContentLoaded", function () {
      const admissionNumber = "your_admission_number"; // Replace this with the actual admission number

    // Variable to track if profile picture has been uploaded
let profilePictureUploaded = false;

// Function to fetch and populate student details
function fetchStudentDetails() {
  $.ajax({
    url: '/populateStudentDetails',
    type: 'GET',
    data: { admissionNumber: admissionNumber },
    success: function (response) {
      $('#studentName').text(response.firstName + ' ' + response.lastName);
      $('#studentFullName').text(response.firstName + ' ' + response.lastName);
      $('#admissionNumber').text(response.admissionNumber);
      $('#courseApplied').text(response.courseApplied);
      $('#emailAddress').text(response.emailAddress);
      if (response.profilePicture) {
        $('#profile-pic').attr('src', response.profilePicture);
        $('#profilePicture').attr('src', response.profilePicture);
        profilePictureUploaded = true; // Set the flag since profile picture exists
      }
    },
    error: function (xhr, status, error) {
      console.error('Error fetching student details:', error);
    }
  });
}

// Call fetchStudentDetails on page load
fetchStudentDetails();

// Function to handle profile picture upload
function handleProfilePictureUpload(files) {
  if (profilePictureUploaded) {
    alert("You have already uploaded a profile picture. It cannot be changed or edited.");
    return;
  }

  if (files.length === 0) return;

  const file = files[0];
  const allowedTypes = ["image/jpeg", "image/png", "image/jfif"];
  if (!allowedTypes.includes(file.type)) {
    alert("Please upload a JPG, PNG, or JFIF file.");
    return;
  }

  const formData = new FormData();
  formData.append('profilePicture', file);
  formData.append('admissionNumber', admissionNumber);

  $.ajax({
    url: '/uploadProfilePicture',
    type: 'POST',
    data: formData,
    processData: false,
    contentType: false,
    success: function (response) {
      const imageUrl = response.imageUrl;
      $('#profile-pic').attr('src', imageUrl);
      $('#profilePicture').attr('src', imageUrl);
      profilePictureUploaded = true; // Update the flag after successful upload
    },
    error: function (xhr, status, error) {
      console.error('Error uploading profile picture:', error);
    }
  });
}

// Event listener for profile picture editing
const editProfileLink = document.getElementById("editProfile");
editProfileLink.addEventListener("click", function (event) {
  event.preventDefault();
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".jpg,.jpeg,.jfif,.png";
  fileInput.addEventListener("change", function () {
    handleProfilePictureUpload(fileInput.files);
  });
  fileInput.click();
});

      // Event listener for logout
      const logoutLink = document.getElementById("logout");
      logoutLink.addEventListener("click", function (event) {
        event.preventDefault();
        window.location.href = "login.html"; // Redirect to login page after logout
      });
    });