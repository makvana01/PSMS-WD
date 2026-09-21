/**
 * PROFILE MANAGER PAGE (Profile.jsx)
 * -------------------------------------------------------------
 * Connections:
 * - Route: '/profile'
 * - Protected: Admin, Student, Company
 * - API Calls:
 *   1. studentService.js -> GET /api/students/profile, PUT /api/students/profile, POST /api/students/upload-resume
 *   2. companyService.js -> GET /api/companies/profile, PUT /api/companies/profile
 */

import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getStudentProfile, updateStudentProfile, uploadResume, uploadAvatar, uploadIdCard } from '../services/studentService';
import { getCompanyProfile, updateCompanyProfile } from '../services/companyService';
import { validateName, validateIndianPhone, validateCGPA, validatePassingYear, validateWebsite } from '../utils/validators';
import { getFileUrl } from '../utils/fileUrl';


const Profile = () => {
  const { user, setUser } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingIdCard, setUploadingIdCard] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Student Form State
  const [studentForm, setStudentForm] = useState({
    name: '',
    phone: '',
    department: 'BCA',
    passingYear: 2026,
    cgpa: '',
    skills: '',
    bio: '',
    resumeUrl: '',
    idCardUrl: '',
    profilePicUrl: ''
  });

  // Company Form State
  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    industry: '',
    website: '',
    location: '',
    phone: '',
    description: ''
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [idCardFile, setIdCardFile] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      if (user.role === 'student') {
        const data = await getStudentProfile();
        setStudentForm({
          name: data.user?.name || user.name || '',
          phone: data.phone || '',
          department: data.department || 'BCA',
          passingYear: data.passingYear || 2026,
          cgpa: data.cgpa || '',
          skills: data.skills ? data.skills.join(', ') : '',
          bio: data.bio || '',
          resumeUrl: data.resumeUrl || '',
          idCardUrl: data.idCardUrl || '',
          profilePicUrl: data.profilePicUrl || ''
        });
      } else if (user.role === 'company') {
        const data = await getCompanyProfile();
        setCompanyForm({
          companyName: data.companyName || user.name || '',
          industry: data.industry || '',
          website: data.website || '',
          location: data.location || '',
          phone: data.phone || '',
          description: data.description || ''
        });
      }
    } catch (err) {
      console.error(err);
      setError('Error fetching profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const { name, phone, department, passingYear, cgpa, skills, bio } = studentForm;

    // 1. Name validation (A-Z, a-z only)
    const nameCheck = validateName(name);
    if (!nameCheck.isValid) {
      setError(nameCheck.message);
      return;
    }

    // 2. Indian Phone number validation
    const phoneCheck = validateIndianPhone(phone);
    if (!phoneCheck.isValid) {
      setError(phoneCheck.message);
      return;
    }

    // 3. Department
    if (!department || !department.trim()) {
      setError('Department / Program is required.');
      return;
    }

    // 4. CGPA score validation (0.0 to 10.0)
    const cgpaCheck = validateCGPA(cgpa);
    if (!cgpaCheck.isValid) {
      setError(cgpaCheck.message);
      return;
    }

    // 5. Passing Year validation (2000 to 2035)
    const yearCheck = validatePassingYear(passingYear);
    if (!yearCheck.isValid) {
      setError(yearCheck.message);
      return;
    }

    // 6. Skills validation
    if (!skills || !skills.trim()) {
      setError('Please provide at least one technical skill.');
      return;
    }

    // 7. Bio validation
    if (!bio || bio.trim().length < 5) {
      setError('Please provide a brief bio or career summary (min 5 characters).');
      return;
    }

    try {
      setUpdating(true);
      await updateStudentProfile({
        ...studentForm,
        name: name.trim(),
        phone: phoneCheck.cleaned || phone.trim()
      });
      setMessage('Profile updated successfully!');
      
      if (name && name !== user.name) {
        const updatedUser = { ...user, name: name.trim() };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Enforce 2MB size limit
    if (file.size > 2 * 1024 * 1024) {
      setError('Profile picture file size must be less than 2MB.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, JPG, PNG and WEBP image files are allowed.');
      return;
    }

    try {
      setUploadingAvatar(true);
      setMessage('');
      setError('');
      
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await uploadAvatar(formData);
      setStudentForm((prev) => ({ ...prev, profilePicUrl: res.profilePicUrl }));
      setMessage('Profile picture uploaded successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Profile picture upload failed');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setError('Please select a PDF file first.');
      return;
    }

    if (resumeFile.type !== 'application/pdf') {
      setError('Only PDF documents are allowed.');
      return;
    }

    try {
      setUploading(true);
      setMessage('');
      setError('');
      const formData = new FormData();
      formData.append('resume', resumeFile);

      const res = await uploadResume(formData);
      setStudentForm((prev) => ({ ...prev, resumeUrl: res.resumeUrl }));
      setMessage('Resume PDF uploaded and saved successfully!');
      setResumeFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Resume upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleIdCardUpload = async (e) => {
    e.preventDefault();
    if (!idCardFile) {
      setError('Please select an ID card file first.');
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(idCardFile.type)) {
      setError('Only PDF, JPG, PNG, and WEBP files are allowed for College ID Card.');
      return;
    }

    if (idCardFile.size > 5 * 1024 * 1024) {
      setError('ID card file size must be less than 5MB.');
      return;
    }

    try {
      setUploadingIdCard(true);
      setMessage('');
      setError('');
      const formData = new FormData();
      formData.append('idCard', idCardFile);

      const res = await uploadIdCard(formData);
      setStudentForm((prev) => ({ ...prev, idCardUrl: res.idCardUrl }));
      setMessage('College ID Card uploaded and saved successfully!');
      setIdCardFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'College ID Card upload failed');
    } finally {
      setUploadingIdCard(false);
    }
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const { companyName, industry, website, location, phone, description } = companyForm;

    if (!companyName || !companyName.trim()) {
      setError('Company name is required.');
      return;
    }

    if (!industry || !industry.trim()) {
      setError('Industry sector is required.');
      return;
    }

    const websiteCheck = validateWebsite(website);
    if (!websiteCheck.isValid) {
      setError(websiteCheck.message);
      return;
    }

    if (!location || !location.trim()) {
      setError('Headquarters location is required.');
      return;
    }

    const phoneCheck = validateIndianPhone(phone);
    if (!phoneCheck.isValid) {
      setError(phoneCheck.message);
      return;
    }

    if (!description || description.trim().length < 10) {
      setError('Company description must be at least 10 characters long.');
      return;
    }

    try {
      setUpdating(true);
      await updateCompanyProfile({
        ...companyForm,
        companyName: companyName.trim(),
        phone: phoneCheck.cleaned || phone.trim()
      });
      setMessage('Company profile updated successfully!');
      if (companyName && companyName !== user.name) {
        const updatedUser = { ...user, name: companyName.trim() };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating company profile');
    } finally {
      setUpdating(false);
    }
  };

  // Calculate Student Profile Completion Percentage
  const calculateStudentCompletion = () => {
    let score = 0;
    const total = 9;
    if (studentForm.name) score++;
    if (studentForm.phone) score++;
    if (studentForm.department) score++;
    if (studentForm.passingYear) score++;
    if (studentForm.cgpa !== '' && studentForm.cgpa !== null) score++;
    if (studentForm.skills) score++;
    if (studentForm.bio) score++;
    if (studentForm.resumeUrl) score++;
    if (studentForm.idCardUrl) score++;
    return Math.round((score / total) * 100);
  };

  const completionPct = user?.role === 'student' ? calculateStudentCompletion() : 100;

  if (loading) {
    return <div className="text-center py-5 text-muted">Loading user profile...</div>;
  }

  const getBackPath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin-dashboard';
    if (user.role === 'company') return '/company-dashboard';
    return '/student-dashboard';
  };

  return (
    <div className="container py-4" style={{ maxWidth: '800px' }}>
      <Link to={getBackPath()} className="btn-back mb-3">
        <i className="bi bi-arrow-left"></i> Back to Dashboard
      </Link>

      <div className="card border-0 shadow-sm rounded-3 p-4 mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
          <div>
            <h2 className="fw-bold text-dark mb-0">Account Profile</h2>
            <small className="text-muted">Manage personal credentials, contact info & placement documents</small>
          </div>
          {user.role === 'student' && (
            <div className="text-md-end">
              <span className={`badge ${completionPct === 100 ? 'bg-success' : 'bg-warning text-dark'} fs-6 fw-bold px-3 py-2 rounded-pill`}>
                <i className={`bi ${completionPct === 100 ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-1`}></i>
                Profile: {completionPct}% Complete
              </span>
            </div>
          )}
        </div>

        {user.role === 'student' && completionPct < 100 && (
          <div className="alert alert-warning border-warning-subtle mt-3 mb-0 py-2 small">
            <i className="bi bi-info-circle-fill me-1"></i>
            <strong>Mandatory Requirements:</strong> Please fill all personal details and upload both your <strong>Resume (PDF)</strong> and <strong>College ID Card</strong> to be eligible to apply for campus placement drives.
          </div>
        )}
      </div>

      {message && <div className="alert alert-success py-2 small">{message}</div>}
      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      {/* STUDENT PROFILE FORM */}
      {user.role === 'student' && (
        <div className="space-y-4">
          {/* PROFILE PICTURE CARD */}
          <div className="card border-0 shadow-sm rounded-3 p-4">
            <h5 className="fw-bold text-dark border-bottom pb-3 mb-3">Profile Picture</h5>
            <div className="d-flex align-items-center gap-4">
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: '#e9ecef',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #dee2e6'
                }}
              >
                {studentForm.profilePicUrl ? (
                  <img
                    src={getFileUrl(studentForm.profilePicUrl)}
                    alt="Profile"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <i className="bi bi-person-fill text-secondary" style={{ fontSize: '2.8rem' }}></i>
                )}
              </div>

              <div>
                <label className="form-label fw-bold small text-secondary mb-1">
                  Upload Photo (JPEG, PNG, WEBP - Max 2MB)
                </label>
                <input
                  type="file"
                  className="form-control form-control-sm mb-2"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
                {uploadingAvatar && <small className="text-primary fw-bold">Uploading picture...</small>}
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-3 p-4">
            <h5 className="fw-bold text-dark border-bottom pb-3 mb-3">Student Information</h5>

            <form onSubmit={handleStudentSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold small text-secondary">Full Name (Alphabets Only) *</label>
                <input
                  type="text"
                  className="form-control"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  placeholder="e.g. Aarav Patel"
                  required
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold small text-secondary">Indian Mobile Number *</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="9876543210 or +91 9876543210"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold small text-secondary">Department / Degree *</label>
                  <select
                    className="form-select"
                    value={studentForm.department}
                    onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                    required
                  >
                    <option value="BCA">Bachelor of Computer Applications (BCA)</option>
                    <option value="MCA">Master of Computer Applications (MCA)</option>
                    <option value="B.Tech CS">B.Tech Computer Science</option>
                    <option value="B.Sc IT">B.Sc Information Technology</option>
                    <option value="Other">Other Degree</option>
                  </select>
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold small text-secondary">Passing Year (2000 - 2035) *</label>
                  <input
                    type="number"
                    className="form-control"
                    min="2000"
                    max="2035"
                    value={studentForm.passingYear}
                    onChange={(e) => setStudentForm({ ...studentForm, passingYear: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold small text-secondary">Current CGPA Score (0.0 - 10.0) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="8.50"
                    className="form-control"
                    value={studentForm.cgpa}
                    onChange={(e) => setStudentForm({ ...studentForm, cgpa: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold small text-secondary">Technical Skills (Comma Separated) *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="React.js, Node.js, MongoDB, Java, SQL"
                  value={studentForm.skills}
                  onChange={(e) => setStudentForm({ ...studentForm, skills: e.target.value })}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold small text-secondary">Short Bio / Career Summary *</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Brief summary of technical interests..."
                  value={studentForm.bio}
                  onChange={(e) => setStudentForm({ ...studentForm, bio: e.target.value })}
                  required
                ></textarea>
              </div>

              <button type="submit" disabled={updating} className="btn btn-primary fw-bold">
                {updating ? 'Saving Profile...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* RESUME UPLOAD CARD */}
          <div className="card border-0 shadow-sm rounded-3 p-4">
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
              <h5 className="fw-bold text-dark mb-0">1. Resume Document (PDF) *</h5>
              {studentForm.resumeUrl ? (
                <span className="badge bg-success-subtle text-success fw-bold">
                  <i className="bi bi-check-circle-fill me-1"></i> Uploaded
                </span>
              ) : (
                <span className="badge bg-danger-subtle text-danger fw-bold">Compulsory</span>
              )}
            </div>

            {studentForm.resumeUrl && (
              <div className="alert alert-success d-flex justify-content-between align-items-center mb-3">
                <div><i className="bi bi-file-earmark-pdf-fill me-1"></i> <strong>Resume PDF Active</strong></div>
                <a
                  href={getFileUrl(studentForm.resumeUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-success btn-sm fw-bold"
                >
                  <i className="bi bi-eye me-1"></i> View Resume
                </a>
              </div>
            )}

            <form onSubmit={handleResumeUpload}>
              <div className="mb-3">
                <label className="form-label fw-bold small text-secondary">Select PDF File (Max 5MB)</label>
                <input
                  type="file"
                  className="form-control"
                  accept="application/pdf"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                />
              </div>

              <button type="submit" disabled={uploading || !resumeFile} className="btn btn-dark fw-bold">
                <i className="bi bi-upload me-1"></i> {uploading ? 'Uploading PDF...' : 'Upload PDF Resume'}
              </button>
            </form>
          </div>

          {/* COLLEGE ID CARD (I-CARD) UPLOAD CARD */}
          <div className="card border-0 shadow-sm rounded-3 p-4">
            <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
              <h5 className="fw-bold text-dark mb-0">2. College ID Card (I-Card) *</h5>
              {studentForm.idCardUrl ? (
                <span className="badge bg-success-subtle text-success fw-bold">
                  <i className="bi bi-check-circle-fill me-1"></i> Uploaded
                </span>
              ) : (
                <span className="badge bg-danger-subtle text-danger fw-bold">Compulsory</span>
              )}
            </div>

            {studentForm.idCardUrl && (
              <div className="alert alert-info d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-person-badge-fill fs-5"></i>
                  <div>
                    <strong>College ID Card Verified</strong>
                    <div className="text-muted small">Uploaded to secure student placement records</div>
                  </div>
                </div>
                <a
                  href={getFileUrl(studentForm.idCardUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm fw-bold"
                >
                  <i className="bi bi-eye me-1"></i> View ID Card
                </a>
              </div>
            )}

            <form onSubmit={handleIdCardUpload}>
              <div className="mb-3">
                <label className="form-label fw-bold small text-secondary">Select College ID Card (PDF, JPG, PNG - Max 5MB)</label>
                <input
                  type="file"
                  className="form-control"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  onChange={(e) => setIdCardFile(e.target.files[0])}
                />
              </div>

              <button type="submit" disabled={uploadingIdCard || !idCardFile} className="btn btn-primary fw-bold">
                <i className="bi bi-upload me-1"></i> {uploadingIdCard ? 'Uploading ID Card...' : 'Upload College ID Card'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* COMPANY PROFILE FORM */}
      {user.role === 'company' && (
        <div className="card border-0 shadow-sm rounded-3 p-4">
          <h5 className="fw-bold text-dark border-bottom pb-3 mb-3">Company Details</h5>

          <form onSubmit={handleCompanySubmit}>
            <div className="mb-3">
              <label className="form-label fw-bold small text-secondary">Company Name *</label>
              <input
                type="text"
                className="form-control"
                value={companyForm.companyName}
                onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                required
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-bold small text-secondary">Industry Sector *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Information Technology"
                  value={companyForm.industry}
                  onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold small text-secondary">Location *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Bangalore, India"
                  value={companyForm.location}
                  onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-bold small text-secondary">Official Website *</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://company.com"
                  value={companyForm.website}
                  onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold small text-secondary">Contact Phone *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="+91 9876543210"
                  value={companyForm.phone}
                  onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold small text-secondary">Company Description *</label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Overview of company mission and products..."
                value={companyForm.description}
                onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                required
              ></textarea>
            </div>

            <button type="submit" disabled={updating} className="btn btn-primary fw-bold">
              {updating ? 'Saving Profile...' : 'Save Company Details'}
            </button>
          </form>
        </div>
      )}

      {/* ADMIN PROFILE */}
      {user.role === 'admin' && (
        <div className="card border-0 shadow-sm rounded-3 p-4">
          <h5 className="fw-bold text-dark border-bottom pb-3 mb-3">Admin Credentials</h5>
          <p className="mb-1"><strong>Name:</strong> {user.name}</p>
          <p className="mb-1"><strong>Email:</strong> {user.email}</p>
          <p className="mb-0"><strong>Role:</strong> System Administrator</p>
        </div>
      )}
    </div>
  );
};

export default Profile;
