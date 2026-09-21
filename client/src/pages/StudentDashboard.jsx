/**
 * STUDENT DASHBOARD (StudentDashboard.jsx)
 * -------------------------------------------------------------
 * Connections:
 * - Route: '/student-dashboard'
 * - Protected: Student role only
 * - API Calls:
 *   1. studentService.js -> GET /api/students/profile
 *   2. applicationService.js -> GET /api/applications/student/my-applications
 *   3. jobService.js -> GET /api/jobs
 */

import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import { getStudentProfile } from '../services/studentService';
import { getStudentApplications } from '../services/applicationService';
import { getJobs } from '../services/jobService';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPromptModal, setShowPromptModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileData = await getStudentProfile();
        setProfile(profileData);

        const appsData = await getStudentApplications();
        setApplications(appsData);

        const jobsData = await getJobs('', '', 'Open');
        setJobs(jobsData.slice(0, 4));

        // Prompt to complete profile if key details or files are missing
        const isIncomplete =
          !profileData.phone ||
          !profileData.bio ||
          !profileData.resumeUrl ||
          !profileData.idCardUrl ||
          !profileData.skills ||
          profileData.skills.length === 0;

        if (isIncomplete) {
          setShowPromptModal(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalApplied = applications.length;
  const shortlistedCount = applications.filter(a => a.status === 'Shortlisted').length;
  const selectedCount = applications.filter(a => a.status === 'Selected').length;

  return (
    <div className="container py-4 space-y-4">
      {/* Pending Admin Confirmation / Deactivation Banner */}
      {(user?.status === 'Deactive' || profile?.status === 'Deactive') && (
        <div className="alert alert-warning border-0 shadow-sm d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4 rounded-3 p-3">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-warning bg-opacity-25 text-warning p-2 rounded-circle">
              <i className="bi bi-clock-history fs-4"></i>
            </div>
            <div>
              <strong className="d-block text-dark">Account Status: Deactive (Pending Admin Confirmation)</strong>
              <span className="small text-secondary">
                New student accounts start in Deactive status. Please ensure your academic profile is complete with your Resume PDF and College ID Card uploaded. The Administrator will review your credentials and activate your account before you can apply for placement drives.
              </span>
            </div>
          </div>
          <Link to="/profile" className="btn btn-warning btn-sm fw-bold text-nowrap align-self-start align-self-md-center">
            Complete Profile Now
          </Link>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="card border-0 bg-primary text-white shadow-sm rounded-3 p-4 mb-4">
        <div className="card-body">
          <span className="badge bg-light text-primary fw-bold mb-2">Student Portal</span>
          <h2 className="fw-bold mb-1">Welcome, {user?.name}!</h2>
          <p className="lead mb-0 text-white-50 fs-6">
            Track your job applications, update your profile, PDF resume & College ID Card, and apply for open company drives.
          </p>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="card border-0 shadow-sm rounded-3 p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center pb-3 border-bottom mb-3">
          <div>
            <h5 className="fw-bold text-dark mb-0">My Placement Profile Summary</h5>
            <small className="text-muted">Academic record, PDF resume & college ID verification</small>
          </div>
          <Link to="/profile" className="btn btn-outline-primary btn-sm fw-bold">
            <i className="bi bi-pencil-square me-1"></i> Edit Profile & Files
          </Link>
        </div>

        {loading ? (
          <div className="text-muted small py-2">Loading profile details...</div>
        ) : (
          <div className="row g-3 text-center">
            <div className="col-6 col-md-3">
              <div className="bg-light p-3 rounded-3 border">
                <small className="text-secondary d-block fw-semibold">Department</small>
                <span className="fw-bold text-dark fs-6">{profile?.department || 'BCA'}</span>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="bg-light p-3 rounded-3 border">
                <small className="text-secondary d-block fw-semibold">CGPA Score</small>
                <span className="fw-bold text-primary fs-6">{profile?.cgpa ? `${Number(profile.cgpa).toFixed(2)} / 10.0` : 'Not Set'}</span>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="bg-light p-3 rounded-3 border">
                <small className="text-secondary d-block fw-semibold">PDF Resume</small>
                {profile?.resumeUrl ? (
                  <span className="badge bg-success fw-bold">Uploaded</span>
                ) : (
                  <span className="badge bg-danger fw-bold">Missing</span>
                )}
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="bg-light p-3 rounded-3 border">
                <small className="text-secondary d-block fw-semibold">College ID Card</small>
                {profile?.idCardUrl ? (
                  <span className="badge bg-success fw-bold">Uploaded</span>
                ) : (
                  <span className="badge bg-danger fw-bold">Missing</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <StatCard
            title="Jobs Applied"
            value={totalApplied}
            iconClass="bi-file-earmark-text"
            bgVariant="primary"
            subtitle="Total drive submissions"
            to="/applications"
          />
        </div>
        <div className="col-md-4">
          <StatCard
            title="Shortlisted"
            value={shortlistedCount}
            iconClass="bi-clock-history"
            bgVariant="warning"
            subtitle="Interview stage"
            to="/applications"
          />
        </div>
        <div className="col-md-4">
          <StatCard
            title="Offers Received"
            value={selectedCount}
            iconClass="bi-trophy-fill"
            bgVariant="success"
            subtitle="Placement confirmations"
            to="/applications"
          />
        </div>
      </div>

      {/* My Applications Table */}
      <div className="card border-0 shadow-sm rounded-3 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-dark mb-0">My Submitted Applications</h5>
          <Link to="/applications" className="btn btn-link btn-sm fw-bold text-decoration-none">
            View All &rarr;
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-4 bg-light rounded-3 border">
            <i className="bi bi-briefcase text-secondary fs-1 d-block mb-2"></i>
            <p className="text-muted small mb-2">You haven't applied for any placement drives yet.</p>
            <Link to="/jobs" className="btn btn-primary btn-sm fw-bold">
              Browse Openings
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small uppercase">
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Salary Package</th>
                  <th>Status</th>
                  <th>Applied On</th>
                </tr>
              </thead>
              <tbody className="small">
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td className="fw-bold text-dark">{app.job?.title || 'N/A'}</td>
                    <td>{app.job?.companyName || 'N/A'}</td>
                    <td className="text-success fw-bold">{app.job?.salary || 'N/A'}</td>
                    <td>
                      <span className={`badge ${
                        app.status === 'Selected' ? 'bg-success' :
                        app.status === 'Shortlisted' ? 'bg-warning text-dark' :
                        app.status === 'Rejected' ? 'bg-danger' :
                        'bg-info text-dark'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="text-muted">{new Date(app.appliedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Profile Completion Prompt Modal */}
      <Modal isOpen={showPromptModal} onClose={() => setShowPromptModal(false)} title="Complete Your Student Profile">
        <div className="text-center py-3">
          <div className="bg-warning bg-opacity-10 text-warning d-inline-block p-3 rounded-circle mb-3">
            <i className="bi bi-exclamation-triangle-fill fs-1"></i>
          </div>
          <h4 className="fw-bold text-dark">Profile Completion Required</h4>
          <p className="text-muted small px-3">
            Welcome to PlacementHub! To participate in campus placement drives, you must complete your academic profile details, upload your PDF resume, and list your technical skills.
          </p>
          <div className="d-flex justify-content-center gap-2 mt-4 pt-2 border-top">
            <button onClick={() => setShowPromptModal(false)} className="btn btn-light fw-bold">
              Explore Dashboard
            </button>
            <Link to="/profile" className="btn btn-primary fw-bold">
              Complete Profile Now
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentDashboard;
