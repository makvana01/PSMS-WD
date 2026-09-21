/**
 * NAVBAR COMPONENT (Navbar.jsx)
 * -------------------------------------------------------------
 * Connections:
 * - Imported by: App.jsx
 * - Connects to: AuthContext (for logged-in user state & logout action)
 * - Links to: Home (/), Jobs (/jobs), Dashboard, Profile (/profile)
 */

import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    setIsNavOpen(false);
    logoutUser();
    navigate('/login', { replace: true });
    try {
      window.history.pushState(null, '', '/login');
    } catch (e) {
      // ignore in environments without history API
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin-dashboard';
    if (user.role === 'company') return '/company-dashboard';
    return '/student-dashboard';
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const closeNav = () => {
    setIsNavOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand d-flex items-center gap-2 fw-bold" to="/" onClick={closeNav}>
          <i className="bi bi-mortarboard-fill fs-4 text-warning"></i>
          <span>PlacementHub</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleNav}
          aria-controls="navbarNav"
          aria-expanded={isNavOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isNavOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-2">
            <li className="nav-item me-lg-2">
              <button onClick={toggleTheme} className="btn-theme-toggle" aria-label="Toggle theme">
                {theme === 'dark' ? (
                  <i className="bi bi-sun-fill fs-5"></i>
                ) : (
                  <i className="bi bi-moon-fill fs-5"></i>
                )}
              </button>
            </li>
            <li className="nav-item">
              <Link className="nav-link font-semibold" to="/jobs" onClick={closeNav}>
                <i className="bi bi-briefcase me-1"></i> Jobs
              </Link>
            </li>

            {user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link font-semibold" to={getDashboardPath()} onClick={closeNav}>
                    <i className="bi bi-speedometer2 me-1"></i> Dashboard
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link font-semibold" to="/applications" onClick={closeNav}>
                    <i className="bi bi-file-earmark-text me-1"></i> Applications
                  </Link>
                </li>

                <li className="nav-item ms-lg-3">
                  <Link to="/profile" className="btn btn-outline-primary btn-sm fw-bold me-2" onClick={closeNav}>
                    <i className="bi bi-person-circle me-1"></i> {user.name} ({user.role?.toUpperCase() || ''})
                  </Link>
                </li>

                <li className="nav-item">
                  <button onClick={handleLogout} className="btn btn-outline-light btn-sm">
                    <i className="bi bi-box-arrow-right me-1"></i> Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="btn btn-outline-light btn-sm me-2" to="/login" onClick={closeNav}>
                    Log In
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-warning btn-sm fw-bold" to="/register" onClick={closeNav}>
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
