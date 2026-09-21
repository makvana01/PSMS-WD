/**
 * COMPANY DASHBOARD (CompanyDashboard.jsx)
 * -------------------------------------------------------------
 * Connections:
 * - Route: '/company-dashboard'
 * - Protected: Company role only
 * - API Calls:
 *   1. companyService.js -> GET /api/companies/profile, GET /api/companies/stats
 *   2. jobService.js -> GET /api/jobs/company/my-jobs, POST /api/jobs, PUT /api/jobs/:id, DELETE /api/jobs/:id
 */

import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import { getCompanyStats, getCompanyProfile } from '../services/companyService';
import { getMyCompanyJobs, createJob, updateJob, deleteJob } from '../services/jobService';
import { validateFutureDate } from '../utils/validators';
import { exportToCSV } from '../utils/csvExport';

const CompanyDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalJobs: 0, totalApplications: 0, shortlistedCount: 0, selectedCount: 0 });
  const [companyProfile, setCompanyProfile] = useState(null);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPromptModal, setShowPromptModal] = useState(false);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    salary: '',
    eligibility: '',
    description: '',
    lastDate: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const profileData = await getCompanyProfile();
      setCompanyProfile(profileData);

      const statsData = await getCompanyStats();
      setStats(statsData);

      const jobsData = await getMyCompanyJobs();
      setMyJobs(jobsData);

      // Prompt to complete profile if key recruiter fields are empty
      const isIncomplete = !profileData.location || !profileData.website || !profileData.phone || !profileData.description;
      if (isIncomplete) {
        setShowPromptModal(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportJobsCSV = () => {
    const columns = [
      { label: 'Job Title', accessor: (j) => j.title },
      { label: 'Company Name', accessor: (j) => j.companyName },
      { label: 'Location', accessor: (j) => j.location },
      { label: 'Salary Package', accessor: (j) => j.salary },
      { label: 'Eligibility', accessor: (j) => j.eligibility },
      { label: 'Approval Status', accessor: (j) => j.approvalStatus },
      { label: 'Job Status', accessor: (j) => j.status },
      { label: 'Last Application Date', accessor: (j) => (j.lastDate ? new Date(j.lastDate).toLocaleDateString() : '') },
      { label: 'Posted Date', accessor: (j) => (j.createdAt ? new Date(j.createdAt).toLocaleDateString() : '') }
    ];
    exportToCSV(myJobs, `my_placement_drives_${new Date().toISOString().split('T')[0]}.csv`, columns);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (job = null) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        title: job.title,
        location: job.location,
        salary: job.salary,
        eligibility: job.eligibility,
        description: job.description,
        lastDate: job.lastDate ? new Date(job.lastDate).toISOString().split('T')[0] : ''
      });
    } else {
      setEditingJob(null);
      setFormData({
        title: '',
        location: '',
        salary: '',
        eligibility: '',
        description: '',
        lastDate: ''
      });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingJob(null);
  };

  const handleSubmitJob = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title || formData.title.trim().length < 3) {
      setFormError('Job title is required (at least 3 characters).');
      return;
    }

    if (!formData.location || !formData.location.trim()) {
      setFormError('Location is required.');
      return;
    }

    if (!formData.salary || !formData.salary.trim()) {
      setFormError('Salary package is required.');
      return;
    }

    if (!formData.eligibility || !formData.eligibility.trim()) {
      setFormError('Eligibility criteria is required.');
      return;
    }

    if (!formData.description || formData.description.trim().length < 15) {
      setFormError('Job description must be at least 15 characters long.');
      return;
    }

    const dateCheck = validateFutureDate(formData.lastDate);
    if (!dateCheck.isValid) {
      setFormError(dateCheck.message);
      return;
    }

    try {
      setSubmitting(true);
      if (editingJob) {
        await updateJob(editingJob._id, {
          ...formData,
          title: formData.title.trim(),
          location: formData.location.trim(),
          salary: formData.salary.trim(),
          eligibility: formData.eligibility.trim(),
          description: formData.description.trim()
        });
      } else {
        await createJob({
          ...formData,
          title: formData.title.trim(),
          location: formData.location.trim(),
          salary: formData.salary.trim(),
          eligibility: formData.eligibility.trim(),
          description: formData.description.trim()
        });
      }
      handleCloseModal();
      loadData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save job post.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteJob = async (id) => {
    if (window.confirm('Are you sure you want to delete this placement drive post and its applicant records?')) {
      try {
        await deleteJob(id);
        loadData();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting job');
      }
    }
  };

  return (
    <div className="container py-4 space-y-4">
      {/* Header Banner */}
      <div className="card border-0 shadow-sm rounded-3 p-4 mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <span className="badge bg-primary-subtle text-primary fw-bold mb-1">
              <i className="bi bi-building me-1"></i> Recruiter Portal
            </span>
            <h2 className="fw-bold text-dark mb-0">
              {companyProfile?.companyName || user?.name} Dashboard
            </h2>
            <small className="text-muted">Manage company placement drives & evaluate candidate applications</small>
          </div>

          <button 
            onClick={() => handleOpenModal()} 
            disabled={companyProfile?.status !== 'Approved'} 
            className="btn btn-primary fw-bold shadow-sm"
            title={companyProfile?.status !== 'Approved' ? 'Account pending approval' : ''}
          >
            <i className="bi bi-plus-circle me-1"></i> Post New Job
          </button>
        </div>
      </div>

      {/* Verification / Deactivation Alert Banner */}
      {companyProfile?.status !== 'Approved' && (
        <div className={`alert ${companyProfile?.status === 'Deactive' || user?.status === 'Deactive' ? 'alert-warning' : 'alert-warning'} border-0 shadow-sm d-flex align-items-center gap-3 mb-4 rounded-3 p-3`}>
          <i className="bi bi-clock-history text-warning fs-3"></i>
          <div>
            <strong className="text-dark">
              {companyProfile?.status === 'Deactive' || user?.status === 'Deactive'
                ? 'Account Status: Deactive (Pending Admin Confirmation & Activation)'
                : companyProfile?.status === 'Rejected'
                ? 'Account Registration Rejected'
                : 'Account Review Pending'}
            </strong>
            <div className="small text-secondary">
              {companyProfile?.status === 'Deactive' || user?.status === 'Deactive'
                ? 'New recruiter accounts are created in Deactive status by default. Please complete your company profile details. The Administrator will review your partnership information and activate your account so you can post campus placement drives.'
                : companyProfile?.status === 'Rejected'
                ? 'Your recruiter account registration has been rejected by the administrator. Please update your profile or contact support.'
                : 'Your recruiter account profile is currently undergoing administrative review. You will be able to post new job placement drives once approved.'}
            </div>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Active Job Listings"
            value={stats.totalJobs}
            iconClass="bi-briefcase-fill"
            bgVariant="primary"
            subtitle="Company drives"
            onClick={() => {
              const target = document.getElementById('my-posted-jobs-section');
              if (target) target.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Total Applicants"
            value={stats.totalApplications}
            iconClass="bi-people-fill"
            bgVariant="purple"
            subtitle="Submissions received"
            to="/applications"
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Shortlisted"
            value={stats.shortlistedCount}
            iconClass="bi-clock-history"
            bgVariant="warning"
            subtitle="Interview candidates"
            to="/applications"
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Selections Made"
            value={stats.selectedCount}
            iconClass="bi-trophy-fill"
            bgVariant="success"
            subtitle="Hired candidates"
            to="/applications"
          />
        </div>
      </div>

      {/* My Posted Jobs Table */}
      <div id="my-posted-jobs-section" className="card border-0 shadow-sm rounded-3 p-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
          <div>
            <h5 className="fw-bold text-dark mb-0">My Posted Placement Drives</h5>
            <small className="text-muted">Manage, edit, or remove your job postings</small>
          </div>
          <div className="d-flex gap-2">
            {myJobs.length > 0 && (
              <button
                type="button"
                onClick={handleExportJobsCSV}
                className="btn btn-outline-success btn-sm fw-bold shadow-sm"
                title="Export your posted jobs to CSV"
              >
                <i className="bi bi-file-earmark-spreadsheet me-1"></i> Export Jobs CSV
              </button>
            )}
            <Link to="/applications" className="btn btn-outline-primary btn-sm fw-bold">
              Review Applicants &rarr;
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4 text-muted">Loading company job drives...</div>
        ) : myJobs.length === 0 ? (
          <div className="text-center py-4 bg-light rounded-3 border">
            <p className="text-muted small mb-2">No jobs posted yet.</p>
            <button onClick={() => handleOpenModal()} className="btn btn-primary btn-sm fw-bold">
              Post Your First Job
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small uppercase">
                <tr>
                  <th>Job Title</th>
                  <th>Location</th>
                  <th>Salary Package</th>
                  <th>Eligibility</th>
                  <th>Approval Status</th>
                  <th>Last Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody className="small">
                {myJobs.map((job) => (
                  <tr key={job._id}>
                    <td className="fw-bold text-dark">{job.title}</td>
                    <td>{job.location}</td>
                    <td className="text-success fw-bold">{job.salary}</td>
                    <td>{job.eligibility}</td>
                    <td>
                      <span className={`badge ${
                        job.approvalStatus === 'Approved' ? 'bg-success' :
                        job.approvalStatus === 'Pending' ? 'bg-warning text-dark' :
                        'bg-danger'
                      }`}>
                        {job.approvalStatus === 'Approved' ? 'Approved' : job.approvalStatus === 'Pending' ? 'Pending Review' : 'Rejected'}
                      </span>
                    </td>
                    <td className="text-muted">{new Date(job.lastDate).toLocaleDateString()}</td>
                    <td className="text-end">
                      <button
                        onClick={() => handleOpenModal(job)}
                        className="btn btn-outline-primary btn-sm me-2"
                        title="Edit Job"
                      >
                        <i className="bi bi-pencil"></i> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job._id)}
                        className="btn btn-outline-danger btn-sm"
                        title="Delete Job"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bootstrap Post/Edit Job Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingJob ? 'Edit Job Posting' : 'Post New Campus Job'}
      >
        <form onSubmit={handleSubmitJob}>
          {formError && <div className="alert alert-danger py-2 small">{formError}</div>}

          <div className="mb-3">
            <label className="form-label fw-bold small text-secondary">Job Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Junior Web Developer"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-bold small text-secondary">Location</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Bangalore / Hybrid"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold small text-secondary">Salary Package</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. ₹6,50,000 PA"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold small text-secondary">Eligibility Criteria</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. BCA 2026 Passouts (CGPA >= 7.5)"
              value={formData.eligibility}
              onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold small text-secondary">Last Apply Date</label>
            <input
              type="date"
              className="form-control"
              value={formData.lastDate}
              onChange={(e) => setFormData({ ...formData, lastDate: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold small text-secondary">Job Description</label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Describe candidate responsibilities and required skills..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          <div className="d-flex justify-content-end gap-2 pt-3 border-top">
            <button type="button" onClick={handleCloseModal} className="btn btn-light fw-bold">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary fw-bold">
              {submitting ? 'Saving...' : editingJob ? 'Update Job' : 'Publish Job'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Profile Completion Prompt Modal */}
      <Modal isOpen={showPromptModal} onClose={() => setShowPromptModal(false)} title="Complete Company Profile">
        <div className="text-center py-3">
          <div className="bg-warning bg-opacity-10 text-warning d-inline-block p-3 rounded-circle mb-3">
            <i className="bi bi-exclamation-triangle-fill fs-1"></i>
          </div>
          <h4 className="fw-bold text-dark">Profile Completion Required</h4>
          <p className="text-muted small px-3">
            Welcome to PlacementHub! To recruit candidates and publish job placement drives, you must complete your company details (website, contact phone, headquarters location, and description).
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

export default CompanyDashboard;
