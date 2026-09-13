const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateName(name) {
  const trimmed = (name || '').trim();
  if (trimmed.length < 20) return 'Name must be at least 20 characters long.';
  if (trimmed.length > 60) return 'Name must not exceed 60 characters.';
  return null;
}

export function validateEmail(email) {
  if (!EMAIL_REGEX.test((email || '').trim())) return 'Please enter a valid email address.';
  return null;
}

export function validateAddress(address) {
  const trimmed = (address || '').trim();
  if (trimmed.length === 0) return 'Address is required.';
  if (trimmed.length > 400) return 'Address must not exceed 400 characters.';
  return null;
}

export function validatePassword(password) {
  const value = password || '';
  if (value.length < 8 || value.length > 16) return 'Password must be between 8 and 16 characters long.';
  if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter.';
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/;'`~]/.test(value)) {
    return 'Password must contain at least one special character.';
  }
  return null;
}

export function validateRating(rating) {
  const num = Number(rating);
  if (!Number.isInteger(num) || num < 1 || num > 5) return 'Rating must be between 1 and 5.';
  return null;
}
