
  function togglePassword(inputId, iconElement) {
  const passwordField = document.getElementById(inputId);

  if (!passwordField) return;

  const isPassword = passwordField.type === 'password';
  passwordField.type = isPassword ? 'text' : 'password';

  iconElement.classList.toggle('fa-eye');
  iconElement.classList.toggle('fa-eye-slash');
}
