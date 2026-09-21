/**
 * LOGIN PAGE (Login.jsx)
 * -------------------------------------------------------------
 * Connections:
 * - Route: '/login'
 * - API Call: authService.js -> POST /api/auth/login
 * - Authenticates user & redirects to role dashboard
 */

import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Captcha from '../components/Captcha';
import { validateEmail } from '../utils/validators';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const captchaRef = useRef(null);
  const { user, loginUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // If user is already authenticated, redirect them directly to their role dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin-dashboard', { replace: true });
      else if (user.role === 'company') navigate('/company-dashboard', { replace: true });
      else navigate('/student-dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Prevent browser back button from navigating back to protected pages after logout
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCaptchaError('');

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.message);
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    // Enforce CAPTCHA Verification
    if (!captchaInput) {
      setCaptchaError('Please enter the CAPTCHA code shown above.');
      return;
    }

    if (!captchaRef.current?.validate(captchaInput)) {
      setCaptchaError('Invalid CAPTCHA code. Please check and try again.');
      captchaRef.current?.refresh();
      return;
    }

    try {
      setLoading(true);
      const res = await loginUser(email.trim(), password);
      if (res.role === 'admin') navigate('/admin-dashboard', { replace: true });
      else if (res.role === 'company') navigate('/company-dashboard', { replace: true });
      else navigate('/student-dashboard', { replace: true });
    } catch (err) {
      if (err.response?.data?.unverified) {
        navigate('/register', { state: { email: err.response.data.email } });
        return;
      }
      setError(err.response?.data?.message || 'Invalid email or password.');
      captchaRef.current?.refresh();
      setCaptchaInput('');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setCaptchaError('');
    // Auto-fill valid captcha for quick testing demo
    if (captchaRef.current) {
      setCaptchaInput(captchaRef.current.getCode());
    }
  };

  return (
    <div className="row justify-content-center py-5">
      <div className="col-md-6 col-lg-5">
        <div className="card border-0 shadow-sm rounded-3 p-4">
          <div className="text-center mb-4">
            <div className="bg-primary bg-opacity-10 text-primary d-inline-block p-3 rounded-circle mb-2">
              <i className="bi bi-key-fill fs-3"></i>
            </div>
            <h3 className="fw-bold text-dark">Welcome Back</h3>
            <p className="text-muted small">Sign in to your PlacementHub account</p>
          </div>

          {error && <div className="alert alert-danger py-2 text-center small">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label fw-bold small text-secondary">Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-light"><i className="bi bi-envelope"></i></span>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@college.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold small text-secondary">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light"><i className="bi bi-lock"></i></span>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* CAPTCHA Component */}
            <Captcha
              ref={captchaRef}
              value={captchaInput}
              onChange={(e) => {
                setCaptchaInput(e.target.value);
                setCaptchaError('');
              }}
              error={captchaError}
            />

            <button type="submit" disabled={loading} className="btn btn-primary w-100 fw-bold py-2 shadow-sm mb-3">
              {loading ? 'Signing in...' : 'Sign In'} <i className="bi bi-box-arrow-in-right ms-1"></i>
            </button>
          </form>

          {/* Viva Quick Fill Credentials */}
          <div className="border-top pt-3 text-center">
            <p className="text-muted small fw-bold mb-2">Demo Quick Fill (For Viva Evaluation):</p>
            <div className="d-flex justify-content-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@college.com', 'password123')}
                className="btn btn-outline-secondary btn-sm"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('rahul@student.com', 'password123')}
                className="btn btn-outline-secondary btn-sm"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('techcorp@company.com', 'password123')}
                className="btn btn-outline-secondary btn-sm"
              >
                Company
              </button>
            </div>
          </div>

          <div className="text-center mt-3">
            <small className="text-muted">
              Don't have an account? <Link to="/register" className="fw-bold text-primary">Register here</Link>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
