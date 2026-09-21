/**
 * VALIDATION UTILITIES (validators.js)
 * -------------------------------------------------------------
 * Centralized validation rules for all client-side forms.
 */

// Name Validation: Only letters (A-Z, a-z) and spaces allowed
export const validateName = (name) => {
  if (!name || !name.trim()) {
    return { isValid: false, message: 'Name is required.' };
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters long.' };
  }
  if (!/^[A-Za-z\s]+$/.test(trimmed)) {
    return { isValid: false, message: 'Name can only contain alphabetic letters (A-Z, a-z) and spaces. Numbers and special characters are not allowed.' };
  }
  return { isValid: true, message: '' };
};

// Indian Phone Number Validation: 10 digits starting with 6, 7, 8, or 9
// Optionally accepts +91 or 0 prefix
export const validateIndianPhone = (phone) => {
  if (!phone || !phone.trim()) {
    return { isValid: false, message: 'Mobile number is required.' };
  }
  // Remove all spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Strip leading +91 or 91 or 0 if present to test 10-digit core
  let coreNumber = cleaned;
  if (cleaned.startsWith('+91')) {
    coreNumber = cleaned.slice(3);
  } else if (cleaned.startsWith('91') && cleaned.length === 12) {
    coreNumber = cleaned.slice(2);
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    coreNumber = cleaned.slice(1);
  }

  if (!/^[6-9]\d{9}$/.test(coreNumber)) {
    return { 
      isValid: false, 
      message: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9 (e.g. 9876543210 or +91 9876543210).' 
    };
  }

  return { isValid: true, message: '', cleaned: coreNumber };
};

// Email Validation
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { isValid: false, message: 'Email address is required.' };
  }
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!regex.test(email.trim())) {
    return { isValid: false, message: 'Please enter a valid email address (e.g. name@example.com).' };
  }
  return { isValid: true, message: '' };
};

// Password Validation: Min 8 chars, 1 uppercase, 1 number, 1 special character
export const validatePassword = (password) => {
  const pwd = password || '';
  const checks = {
    hasMinLength: pwd.length >= 8,
    hasUpper: /[A-Z]/.test(pwd),
    hasLower: /[a-z]/.test(pwd),
    hasNumber: /[0-9]/.test(pwd),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pwd)
  };

  const isValid = checks.hasMinLength && checks.hasUpper && checks.hasNumber && checks.hasSpecial;

  let message = '';
  if (!isValid) {
    if (!checks.hasMinLength) message = 'Password must be at least 8 characters long.';
    else if (!checks.hasUpper) message = 'Password must contain at least one uppercase letter (A-Z).';
    else if (!checks.hasNumber) message = 'Password must contain at least one number (0-9).';
    else if (!checks.hasSpecial) message = 'Password must contain at least one special character (!@#$%^&*...).';
  }

  return {
    isValid,
    message,
    checks
  };
};

// CGPA Validation: Decimal between 0.0 and 10.0
export const validateCGPA = (cgpa) => {
  if (cgpa === '' || cgpa === null || cgpa === undefined) {
    return { isValid: false, message: 'CGPA score is required.' };
  }
  const num = parseFloat(cgpa);
  if (isNaN(num) || num < 0 || num > 10) {
    return { isValid: false, message: 'CGPA must be a valid number between 0.0 and 10.0.' };
  }
  return { isValid: true, message: '' };
};

// Passing Year Validation: Year between 2000 and 2035
export const validatePassingYear = (year) => {
  if (!year) {
    return { isValid: false, message: 'Passing year is required.' };
  }
  const num = parseInt(year, 10);
  if (isNaN(num) || num < 2000 || num > 2035) {
    return { isValid: false, message: 'Passing year must be between 2000 and 2035.' };
  }
  return { isValid: true, message: '' };
};

// Website URL Validation
export const validateWebsite = (url) => {
  if (!url || !url.trim()) {
    return { isValid: false, message: 'Website URL is required.' };
  }
  const pattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i;
  if (!pattern.test(url.trim())) {
    return { isValid: false, message: 'Please enter a valid website URL (e.g. https://company.com).' };
  }
  return { isValid: true, message: '' };
};

// Future / Current Date Validation
export const validateFutureDate = (dateStr) => {
  if (!dateStr) {
    return { isValid: false, message: 'Last application date is required.' };
  }
  const selectedDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(selectedDate.getTime())) {
    return { isValid: false, message: 'Please enter a valid date.' };
  }

  if (selectedDate < today) {
    return { isValid: false, message: 'Last apply date cannot be in the past. Please select today or a future date.' };
  }
  return { isValid: true, message: '' };
};
