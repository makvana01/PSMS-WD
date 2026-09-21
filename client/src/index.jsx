/**
 * MAIN ENTRY POINT (index.jsx)
 * -------------------------------------------------------------
 * Connections:
 * - Renders <App /> into public/index.html DOM root ('#root')
 * - Imports Bootstrap 5 CSS, Bootstrap Icons, & Custom index.css
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Bootstrap 5 CSS & Icons
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
