 function togglePassword() {
    const passwordField = document.getElementById('CustomerPassword');
    const icon = document.getElementById('toggleIcon');

    const isPassword = passwordField.type === 'password';
    passwordField.type = isPassword ? 'text' : 'password';

    // Toggle icon class
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
  }