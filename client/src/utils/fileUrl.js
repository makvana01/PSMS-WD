/**
 * FILE URL RESOLVER UTILITY (fileUrl.js)
 * -------------------------------------------------------------
 * Ensures that relative file paths stored on the server (e.g. '/uploads/resumes/...')
 * are converted to absolute URLs pointing to the backend API server (port 5000),
 * allowing PDF resumes, ID cards, and avatars to open natively in the browser.
 */

const getBackendBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '');
  }
  // Default to backend port 5000 in development
  const hostname = window.location.hostname || 'localhost';
  return `http://${hostname}:5000`;
};

export const getFileUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  
  // If already absolute or blob/data URI, return as-is
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url;
  }

  const baseUrl = getBackendBaseUrl();
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${cleanPath}`;
};
