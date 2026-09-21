/**
 * STAT CARD COMPONENT (StatCard.jsx)
 * -------------------------------------------------------------
 * Connections:
 * - Imported by: AdminDashboard.jsx, StudentDashboard.jsx, CompanyDashboard.jsx
 * - Description: Reusable dashboard metric card with optional link/click navigation
 */

import React from 'react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, iconClass, bgVariant = 'primary', subtitle, to, onClick }) => {
  const content = (
    <div className={`card border-0 shadow-sm rounded-3 h-100 stat-card-hover ${to || onClick ? 'cursor-pointer' : ''}`}
      style={{
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: to || onClick ? 'pointer' : 'default',
        textDecoration: 'none'
      }}
      onClick={onClick}
    >
      <div className="card-body p-4">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h6 className="text-muted fw-normal mb-1">{title}</h6>
            <h3 className="fw-bold mb-0 text-dark">{value}</h3>
            {subtitle && <small className="text-secondary d-block mt-1">{subtitle}</small>}
          </div>
          <div className={`bg-${bgVariant} bg-opacity-10 text-${bgVariant} p-3 rounded-3 d-flex align-items-center justify-content-center`} style={{ minWidth: '54px', minHeight: '54px' }}>
            <i className={`bi ${iconClass} fs-3`}></i>
          </div>
        </div>
        {(to || onClick) && (
          <div className="mt-2 pt-2 border-top d-flex align-items-center justify-content-between text-primary small fw-semibold">
            <span>View details</span>
            <i className="bi bi-arrow-right"></i>
          </div>
        )}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
        {content}
      </Link>
    );
  }

  return content;
};

export default StatCard;
