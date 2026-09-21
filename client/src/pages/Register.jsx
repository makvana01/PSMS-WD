/**
 * REGISTER PAGE (Register.jsx)
 * -------------------------------------------------------------
 * Connections:
 * - Route: '/register'
 * - API Call: authService.js -> POST /api/auth/register, POST /api/auth/verify-otp, POST /api/auth/resend-otp
 * - Registers new Student or Company account and confirms via OTP email
 */

import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Captcha from '../components/Captcha';
import { validateName, validateIndianPhone, validateEmail, validatePassword } from '../utils/validators';

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [companyName, setCompanyName] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP Verification States
  const [isOtpSent, setIsOtpSent] = useState(location.state?.email ? true : false);
  const [otpEmail, setOtpEmail] = useState(location.state?.email || '');
  const [otpCode, setOtpCode] = useState('');

  const captchaRef = useRef(null);
  const { user, registerUser, verifyOtpUser, resendOtpUser } = useContext(AuthContext);

  // If user is already authenticated, redirect them directly to their role dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin-dashboard', { replace: true });
      else if (user.role === 'company') navigate('/company-dashboard', { replace: true });
      else navigate('/student-dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Calculate live password validation state
  const pwdValidation = validatePassword(password);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setCaptchaError('');
    setSuccessMessage('');

    // 1. Validate Name (A-Z, a-z and spaces only)
    const nameCheck = validateName(name);
    if (!nameCheck.isValid) {
      setError(nameCheck.message);
      return;
    }

    // 2. Validate Company Name (if recruiter)
    if (role === 'company') {
      if (!companyName || !companyName.trim()) {
        setError('Company Name is required for recruiter registration.');
        return;
      }
    }

    // 3. Validate Indian Mobile Number (10 digits starting with 6,7,8,9)
    const phoneCheck = validateIndianPhone(phone);
    if (!phoneCheck.isValid) {
      setError(phoneCheck.message);
      return;
    }

    // 4. Validate Email Address
    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      setError(emailCheck.message);
      return;
    }

    // 5. Validate Strong Password Policy
    if (!pwdValidation.isValid) {
      setError(pwdValidation.message || 'Password does not meet all security requirements.');
      return;
    }

    // 6. Validate Password Confirmation
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your confirm password.');
      return;
    }

    // 7. Enforce CAPTCHA
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
      await registerUser({
        name: name.trim(),
        phone: phoneCheck.cleaned || phone.trim(),
        email: email.trim(),
        password,
        role,
        companyName: role === 'company' ? companyName.trim() : undefined
      });

      setOtpEmail(email.trim());
      setIsOtpSent(true);
      setSuccessMessage('A registration confirmation OTP has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
      captchaRef.current?.refresh();
      setCaptchaInput('');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!otpCode) {
      setError('Please enter the OTP verification code.');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyOtpUser(otpEmail, otpCode);
      setSuccessMessage('Email verified successfully! Logging you in...');
      setTimeout(() => {
        if (res.role === 'company') navigate('/company-dashboard', { replace: true });
        else navigate('/student-dashboard', { replace: true });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccessMessage('');
    try {
      setLoading(true);
      await resendOtpUser(otpEmail);
      setSuccessMessage('A new verification code has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center py-4">
      <div className="col-md-6 col-lg-5">
        <div className="card border-0 shadow-sm rounded-3 p-4">
          
          {/* OTP Verification Form */}
          {isOtpSent ? (
            <>
              <div className="text-center mb-3">
                <div className="bg-primary bg-opacity-10 text-primary d-inline-block p-3 rounded-circle mb-2">
                  <i className="bi bi-shield-lock-fill fs-3"></i>
                </div>
                <h3 className="fw-bold text-dark">Verify Your Account</h3>
                <p className="text-muted small">We sent a 6-digit confirmation code to your email.</p>
              </div>

              {error && <div className="alert alert-danger py-2 text-center small">{error}</div>}
              {successMessage && <div className="alert alert-success py-2 text-center small">{successMessage}</div>}

              <div className="alert alert-info py-2 text-center small mb-3">
                <strong>Demo Hint:</strong> If sandbox restricts email dispatch, check the server console logs for the OTP verification code!
              </div>

              <form onSubmit={handleVerifyOtp}>
                <div className="mb-3">
                  <label className="form-label fw-bold small text-secondary">Verification Code</label>
                  <input
                    type="text"
                    className="form-control text-center fs-4 fw-bold letter-spacing-lg"
                    placeholder="123456"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary w-100 fw-bold py-2 shadow-sm mb-3">
                  {loading ? 'Verifying OTP...' : 'Verify & Continue'} <i className="bi bi-patch-check ms-1"></i>
                </button>

                <div className="d-flex justify-content-between align-items-center mt-2">
                  <button
                    type="button"
                    onClick={() => setIsOtpSent(false)}
                    className="btn btn-link text-decoration-none small p-0 text-secondary"
                  >
                    &larr; Back to Register
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="btn btn-link text-decoration-none small p-0 text-primary fw-bold"
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Registration Form */
            <>
              <div className="text-center mb-3">
                <div className="bg-primary bg-opacity-10 text-primary d-inline-block p-3 rounded-circle mb-2">
                  <i className="bi bi-person-plus-fill fs-3"></i>
                </div>
                <h3 className="fw-bold text-dark">Create Account</h3>
                <p className="text-muted small">Register as a Student or Recruiter</p>
              </div>

              {error && <div className="alert alert-danger py-2 text-center small">{error}</div>}
              {successMessage && <div className="alert alert-success py-2 text-center small">{successMessage}</div>}

              <form onSubmit={handleRegister}>
                {/* Role Switcher */}
                <div className="mb-3">
                  <label className="form-label fw-bold small text-secondary">Register As</label>
                  <div className="btn-group w-100" role="group">
                    <button
                      type="button"
                      className={`btn ${role === 'student' ? 'btn-primary' : 'btn-outline-primary'} fw-bold btn-sm`}
                      onClick={() => setRole('student')}
                    >
                      <i className="bi bi-person-badge me-1"></i> Student
                    </button>
                    <button
                      type="button"
                      className={`btn ${role === 'company' ? 'btn-primary' : 'btn-outline-primary'} fw-bold btn-sm`}
                      onClick={() => setRole('company')}
                    >
                      <i className="bi bi-building me-1"></i> Company
                    </button>
                  </div>
                </div>

                {/* Full Name */}
                <div className="mb-3">
                  <label className="form-label fw-bold small text-secondary d-flex justify-content-between">
                    <span>{role === 'company' ? 'Recruiter Contact Name *' : 'Full Name (A-Z only) *'}</span>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Letters & spaces only</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><i className="bi bi-person"></i></span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {role === 'company' && (
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-secondary">Company / Organization Name *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light"><i className="bi bi-building"></i></span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. TechCorp Solutions"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Mobile Number */}
                <div className="mb-3">
                  <label className="form-label fw-bold small text-secondary d-flex justify-content-between">
                    <span>Indian Mobile Number *</span>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>10 digits starting with 6-9</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><i className="bi bi-telephone"></i></span>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="e.g. 9876543210 or +91 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="mb-3">
                  <label className="form-label fw-bold small text-secondary">Email Address *</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><i className="bi bi-envelope"></i></span>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="mb-2">
                  <label className="form-label fw-bold small text-secondary">Password (Strong) *</label>
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

                {/* Live Password Strength Checklist */}
                {password.length > 0 && (
                  <div className="password-checklist mb-3">
                    <div className="fw-bold small text-secondary mb-1">Password Requirements:</div>
                    <div className="row g-1">
                      <div className={`col-6 checklist-item ${pwdValidation.checks.hasMinLength ? 'valid' : 'invalid'}`}>
                        <i className={`bi ${pwdValidation.checks.hasMinLength ? 'bi-check-circle-fill' : 'bi-dash-circle'}`}></i>
                        <span>Min 8 characters</span>
                      </div>
                      <div className={`col-6 checklist-item ${pwdValidation.checks.hasUpper ? 'valid' : 'invalid'}`}>
                        <i className={`bi ${pwdValidation.checks.hasUpper ? 'bi-check-circle-fill' : 'bi-dash-circle'}`}></i>
                        <span>1 Uppercase (A-Z)</span>
                      </div>
                      <div className={`col-6 checklist-item ${pwdValidation.checks.hasNumber ? 'valid' : 'invalid'}`}>
                        <i className={`bi ${pwdValidation.checks.hasNumber ? 'bi-check-circle-fill' : 'bi-dash-circle'}`}></i>
                        <span>1 Number (0-9)</span>
                      </div>
                      <div className={`col-6 checklist-item ${pwdValidation.checks.hasSpecial ? 'valid' : 'invalid'}`}>
                        <i className={`bi ${pwdValidation.checks.hasSpecial ? 'bi-check-circle-fill' : 'bi-dash-circle'}`}></i>
                        <span>1 Special symbol (@#$)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirm Password Field */}
                <div className="mb-3">
                  <label className="form-label fw-bold small text-secondary">Confirm Password *</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><i className="bi bi-shield-check"></i></span>
                    <input
                      type="password"
                      className={`form-control ${confirmPassword && confirmPassword !== password ? 'is-invalid' : ''}`}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <div className="text-danger small mt-1">Passwords do not match</div>
                  )}
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
                  {loading ? 'Creating Account...' : 'Register'} <i className="bi bi-arrow-right-circle ms-1"></i>
                </button>
              </form>

              <div className="text-center mt-2">
                <small className="text-muted">
                  Already registered? <Link to="/login" className="fw-bold text-primary">Log in here</Link>
                </small>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Register;
