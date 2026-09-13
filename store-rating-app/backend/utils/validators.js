// Centralized backend validation rules.
// All rules mirror the frontend validation so the backend never
// relies solely on the client to enforce them.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateName(name) {
  if (typeof name !== 'string') return 'Name is required.';
  const trimmed = name.trim();
  if (trimmed.length < 20) return 'Name must be at least 20 characters long.';
  if (trimmed.length > 60) return 'Name must not exceed 60 characters.';
  return null;
}

function validateEmail(email) {
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return 'Please enter a valid email address.';
  }
  return null;
}

function validateAddress(address) {
  if (typeof address !== 'string' || address.trim().length === 0) {
    return 'Address is required.';
  }
  if (address.trim().length > 400) {
    return 'Address must not exceed 400 characters.';
  }
  return null;
}

function validatePassword(password) {
  if (typeof password !== 'string') return 'Password is required.';
  if (password.length < 8 || password.length > 16) {
    return 'Password must be between 8 and 16 characters long.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/;'`~]/.test(password)) {
    return 'Password must contain at least one special character.';
  }
  return null;
}

function validateRole(role) {
  const allowed = ['admin', 'user', 'owner'];
  if (!allowed.includes(role)) {
    return 'Role must be one of: admin, user, owner.';
  }
  return null;
}

function validateRating(rating) {
  const num = Number(rating);
  if (!Number.isInteger(num) || num < 1 || num > 5) {
    return 'Rating must be an integer between 1 and 5.';
  }
  return null;
}

module.exports = {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
  validateRole,
  validateRating,
};
