/**
 * FOOTER COMPONENT (Footer.jsx)
 * -------------------------------------------------------------
 * Connections:
 * - Imported by: App.jsx
 */

import React from 'react';

const Footer = () => {
  return (
    <footer className="border-top py-4 mt-auto">
      <div className="container">
        <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2 text-muted">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-mortarboard-fill text-primary fs-5"></i>
            <span className="fw-bold text-dark">PlacementHub</span>
            <span className="small text-secondary">| BCA Sem 5 AWD Project</span>
          </div>
          <div className="small text-center text-sm-end">
            &copy; {new Date().getFullYear()} Smart Campus Placement Management System. Bootstrap 5 UI.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
