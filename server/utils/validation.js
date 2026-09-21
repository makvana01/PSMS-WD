/**
 * BACKEND VALIDATION UTILITIES (validation.js)
 * -------------------------------------------------------------
 * Strict server-side validation rules matching client requirements.
 */

const isValidName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 50) return false;
  return /^[A-Za-z\s]+$/.test(trimmed);
};

const isValidIndianPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  let coreNumber = cleaned;
  if (cleaned.startsWith('+91')) {
    coreNumber = cleaned.slice(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    coreNumber = cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    coreNumber = cleaned.slice(1);
  }
  return /^[6-9]\d{9}$/.test(coreNumber);
};

const cleanIndianPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return phone;
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+91')) return cleaned.slice(3);
  if (cleaned.startsWith('91') && cleaned.length === 12) return cleaned.slice(2);
  if (cleaned.startsWith('0') && cleaned.length === 11) return cleaned.slice(1);
  return cleaned;
};

const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
};

const isValidPassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  // Min 8 chars, 1 uppercase letter, 1 number, 1 special character
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);
  return hasMinLength && hasUpper && hasNumber && hasSpecial;
};

const isValidCGPA = (cgpa) => {
  if (cgpa === '' || cgpa === null || cgpa === undefined) return false;
  const num = parseFloat(cgpa);
  return !isNaN(num) && num >= 0.0 && num <= 10.0;
};

const isValidYear = (year) => {
  if (!year) return false;
  const num = parseInt(year, 10);
  return !isNaN(num) && num >= 2000 && num <= 2035;
};

const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i.test(url.trim());
};

const isFutureOrToday = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today;
};

module.exports = {
  isValidName,
  isValidIndianPhone,
  cleanIndianPhone,
  isValidEmail,
  isValidPassword,
  isValidCGPA,
  isValidYear,
  isValidUrl,
  isFutureOrToday
};
