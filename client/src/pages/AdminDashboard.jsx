/**
 * ADMIN DASHBOARD (AdminDashboard.jsx)
 * -------------------------------------------------------------
 * Connections:
 * - Route: '/admin-dashboard'
 * - Protected: Admin role only
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import RecycleBinModal from '../components/RecycleBinModal';
import { getAdminStats, getAllApplicationsAdmin } from '../services/applicationService';
import { getAllCompaniesAdmin, updateCompanyStatusAdmin } from '../services/companyService';
import { getJobs, updateJobStatusAdmin } from '../services/jobService';
import { deleteJobAdmin, updateJobAdmin } from '../services/adminService';
import { exportToCSV } from '../utils/csvExport';


const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCompanies: 0,
    totalJobs: 0,
    totalApplications: 0,
    pendingCompaniesCount: 0,
    pendingJobsCount: 0,
    totalTrashCount: 0
  });
  const [recentApps, setRecentApps] = useState([]);
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, companies, pending_jobs, all_jobs
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  // Edit Job State
  const [isEditJobModalOpen, setIsEditJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobFormData, setJobFormData] = useState({
    title: '',
    companyName: '',
    location: '',
    salary: '',
    eligibility: '',
    description: '',
    status: 'Open'
  });
  const [jobFormError, setJobFormError] = useState('');
  const [jobSubmitting, setJobSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const statsData = await getAdminStats();
      setStats(statsData);

      const appsData = await getAllApplicationsAdmin();
      setRecentApps(appsData.slice(0, 5));

      const comps = await getAllCompaniesAdmin();
      setPendingCompanies(comps.filter(c => c.status === 'Pending' || c.status === 'Deactive' || c.user?.status === 'Deactive'));

      const jbs = await getJobs();
      setAllJobs(jbs);
      setPendingJobs(jbs.filter(j => j.approvalStatus === 'Pending'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCompanyStatus = async (userId, newStatus, companyName) => {
    const action = newStatus === 'Approved' ? 'approve' : 'reject';
    if (window.confirm(`Are you sure you want to ${action} recruiter account for '${companyName}'?`)) {
      try {
        await updateCompanyStatusAdmin(userId, newStatus);
        setActionMessage(`Recruiter account successfully ${newStatus.toLowerCase()}d!`);
        fetchDashboardData();
        setTimeout(() => setActionMessage(''), 4000);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to update company status.');
      }
    }
  };

  const handleJobStatus = async (jobId, newStatus, jobTitle) => {
    const action = newStatus === 'Approved' ? 'approve' : 'reject';
    if (window.confirm(`Are you sure you want to ${action} job post '${jobTitle}'?`)) {
      try {
        await updateJobStatusAdmin(jobId, newStatus);
        setActionMessage(`Job post successfully ${newStatus.toLowerCase()}d!`);
        fetchDashboardData();
        setTimeout(() => setActionMessage(''), 4000);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to update job status.');
      }
    }
  };

  const handleDeleteJob = async (jobId, title) => {
    if (window.confirm(`Move placement drive '${title}' to the Recycle Bin (Soft Delete)?`)) {
      try {
        await deleteJobAdmin(jobId);
        setActionMessage(`Job '${title}' moved to Recycle Bin.`);
        fetchDashboardData();
        setTimeout(() => setActionMessage(''), 4000);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete job post.');
      }
    }
  };

  const handleEditJobClick = (job) => {
    setEditingJob(job);
    setJobFormData({
      title: job.title || '',
      companyName: job.companyName || '',
      location: job.location || '',
      salary: job.salary || '',
      eligibility: job.eligibility || '',
      description: job.description || '',
      status: job.status || 'Open'
    });
    setJobFormError('');
    setIsEditJobModalOpen(true);
  };

  const handleJobFormSubmit = async (e) => {
    e.preventDefault();
    setJobFormError('');

    if (!jobFormData.title || jobFormData.title.trim().length < 3) {
      setJobFormError('Job title must be at least 3 characters.');
      return;
    }

    try {
      setJobSubmitting(true);
      await updateJobAdmin(editingJob._id, jobFormData);
      setIsEditJobModalOpen(false);
      setActionMessage('Job details updated successfully by Administrator!');
      fetchDashboardData();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      setJobFormError(err.response?.data?.message || 'Failed to update job.');
    } finally {
      setJobSubmitting(false);
    }
  };

  const handleExportAllJobsCSV = () => {
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
    exportToCSV(allJobs, `all_placement_drives_${new Date().toISOString().split('T')[0]}.csv`, columns);
  };

  const handleExportRecentAppsCSV = () => {
    const columns = [
      { label: 'Candidate Name', accessor: (a) => a.student?.name || 'N/A' },
      { label: 'Job Title', accessor: (a) => a.job?.title || 'N/A' },
      { label: 'Company', accessor: (a) => a.job?.companyName || 'N/A' },
      { label: 'Status', accessor: (a) => a.status },
      { label: 'Applied Date', accessor: (a) => (a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : '') }
    ];
    exportToCSV(recentApps, `recent_applications_${new Date().toISOString().split('T')[0]}.csv`, columns);
  };

  return (
    <div className="container py-4 space-y-4">
      {/* Header Banner */}
      <div className="card border-0 shadow-sm rounded-3 p-4 mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <span className="badge bg-primary-subtle text-primary fw-bold mb-1">
              <i className="bi bi-shield-check me-1"></i> Administrator Control Center
            </span>
            <h2 className="fw-bold text-dark mb-0">Campus Placement Overview</h2>
            <small className="text-muted">Real-time statistics, active user accounts & placement drives</small>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <Link to="/applications" className="btn btn-outline-success btn-sm fw-bold shadow-sm">
              <i className="bi bi-file-earmark-spreadsheet me-1"></i> Export Applications CSV
            </Link>
            <button
              type="button"
              onClick={() => setIsTrashOpen(true)}
              className="btn btn-outline-danger btn-sm fw-bold shadow-sm"
            >
              <i className="bi bi-trash3 me-1"></i> Recycle Bin / Trash
            </button>
            <Link to="/manage-students" className="btn btn-outline-secondary btn-sm fw-bold">
              <i className="bi bi-people me-1"></i> Manage Students
            </Link>
            <Link to="/manage-companies" className="btn btn-outline-primary btn-sm fw-bold">
              <i className="bi bi-building me-1"></i> Manage Companies
            </Link>
          </div>
        </div>
      </div>

      {actionMessage && <div className="alert alert-success py-2 small shadow-sm">{actionMessage}</div>}

      {/* Metrics Row */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Total Students"
            value={loading ? '...' : stats.totalStudents}
            iconClass="bi-people-fill"
            bgVariant="primary"
            subtitle="Active candidates"
            to="/manage-students"
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Total Companies"
            value={loading ? '...' : stats.totalCompanies}
            iconClass="bi-building"
            bgVariant="info"
            subtitle="Recruiter partners"
            to="/manage-companies"
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Active Job Drives"
            value={loading ? '...' : stats.totalJobs}
            iconClass="bi-briefcase-fill"
            bgVariant="success"
            subtitle="Approved postings"
            onClick={() => {
              setActiveTab('all_jobs');
              const target = document.getElementById('admin-tab-nav');
              if (target) target.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Total Applications"
            value={loading ? '...' : stats.totalApplications}
            iconClass="bi-file-earmark-text-fill"
            bgVariant="warning"
            subtitle="Submissions received"
            to="/applications"
          />
        </div>
      </div>

      {/* Approvals Warning Alert */}
      {(stats.pendingCompaniesCount > 0 || stats.pendingJobsCount > 0) && (
        <div className="alert alert-warning border-0 shadow-sm d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 rounded-3 p-3">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill text-warning fs-4"></i>
            <div>
              <strong className="text-dark">Action Required: Pending Approvals</strong>
              <div className="small text-secondary">
                You have {stats.pendingCompaniesCount} pending recruiter accounts and {stats.pendingJobsCount} pending job posts.
              </div>
            </div>
          </div>
          <div className="d-flex gap-2">
            {stats.pendingCompaniesCount > 0 && (
              <button onClick={() => setActiveTab('companies')} className="btn btn-warning btn-sm fw-bold">
                Review Companies ({stats.pendingCompaniesCount})
              </button>
            )}
            {stats.pendingJobsCount > 0 && (
              <button onClick={() => setActiveTab('jobs')} className="btn btn-dark btn-sm fw-bold">
                Review Job Posts ({stats.pendingJobsCount})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content Tabs Navigation */}
      <div id="admin-tab-nav" className="card border-0 shadow-sm rounded-3 p-3 mb-4">
        <ul className="nav nav-pills gap-2">
          <li className="nav-item">
            <button
              onClick={() => setActiveTab('overview')}
              className={`nav-link font-semibold ${activeTab === 'overview' ? 'active bg-primary text-white' : 'text-secondary'}`}
            >
              <i className="bi bi-grid-fill me-1"></i> Dashboard Overview
            </button>
          </li>
          <li className="nav-item">
            <button
              onClick={() => setActiveTab('all_jobs')}
              className={`nav-link font-semibold ${activeTab === 'all_jobs' ? 'active bg-primary text-white' : 'text-secondary'}`}
            >
              <i className="bi bi-briefcase me-1"></i> All Placement Drives ({allJobs.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              onClick={() => setActiveTab('companies')}
              className={`nav-link font-semibold position-relative ${activeTab === 'companies' ? 'active bg-primary text-white' : 'text-secondary'}`}
            >
              <i className="bi bi-building-fill me-1"></i> Pending Companies
              {pendingCompanies.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {pendingCompanies.length}
                </span>
              )}
            </button>
          </li>
          <li className="nav-item">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`nav-link font-semibold position-relative ${activeTab === 'jobs' ? 'active bg-primary text-white' : 'text-secondary'}`}
            >
              <i className="bi bi-clock-history me-1"></i> Pending Approvals
              {pendingJobs.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {pendingJobs.length}
                </span>
              )}
            </button>
          </li>
        </ul>
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="card border-0 shadow-sm rounded-3 p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-dark mb-0">Recent Applications Activity</h5>
            <Link to="/applications" className="btn btn-link btn-sm fw-bold text-decoration-none">
              View All Applications &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-4 text-muted">Loading recent activity...</div>
          ) : recentApps.length === 0 ? (
            <div className="text-center py-4 text-muted">No recent applications found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small uppercase">
                  <tr>
                    <th>Student Name</th>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {recentApps.map((app) => (
                    <tr key={app._id}>
                      <td className="fw-bold text-dark">{app.student?.name || 'N/A'}</td>
                      <td>{app.job?.title || 'N/A'}</td>
                      <td>{app.job?.companyName || 'N/A'}</td>
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
      )}

      {/* ALL PLACEMENT DRIVES TAB */}
      {activeTab === 'all_jobs' && (
        <div className="card border-0 shadow-sm rounded-3 p-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
            <div>
              <h5 className="fw-bold text-dark mb-0">All Placement Drives Management</h5>
              <small className="text-muted">Full administrative edit and soft-delete control</small>
            </div>
            {allJobs.length > 0 && (
              <button
                type="button"
                onClick={handleExportAllJobsCSV}
                className="btn btn-outline-success btn-sm fw-bold shadow-sm"
                title="Export all placement drives to CSV"
              >
                <i className="bi bi-file-earmark-spreadsheet me-1"></i> Export Drives CSV
              </button>
            )}
          </div>

          {allJobs.length === 0 ? (
            <div className="text-center py-4 text-muted">No active placement drives found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0 small">
                <thead className="table-light uppercase">
                  <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Salary</th>
                    <th>Approval</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allJobs.map((job) => (
                    <tr key={job._id}>
                      <td className="fw-bold text-dark">{job.title}</td>
                      <td><span className="badge bg-light text-dark border">{job.companyName}</span></td>
                      <td>{job.location}</td>
                      <td className="text-success fw-bold">{job.salary}</td>
                      <td>
                        <span className={`badge ${job.approvalStatus === 'Approved' ? 'bg-success-subtle text-success' : job.approvalStatus === 'Pending' ? 'bg-warning-subtle text-warning' : 'bg-danger-subtle text-danger'} fw-bold`}>
                          {job.approvalStatus}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${job.status === 'Open' ? 'bg-primary-subtle text-primary' : 'bg-secondary'} fw-bold`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          onClick={() => handleEditJobClick(job)}
                          className="btn btn-outline-primary btn-sm me-2"
                          title="Admin Edit Job"
                        >
                          <i className="bi bi-pencil"></i> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job._id, job.title)}
                          className="btn btn-outline-danger btn-sm"
                          title="Move Job to Recycle Bin"
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
      )}

      {activeTab === 'companies' && (
        <div className="card border-0 shadow-sm rounded-3 p-4">
          <h5 className="fw-bold text-dark mb-3">Pending Recruiter Approvals</h5>
          {pendingCompanies.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-check-circle-fill text-success fs-1 mb-2 d-block"></i>
              No company registration accounts are pending approval.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small uppercase">
                  <tr>
                    <th>Company Name</th>
                    <th>Contact Email</th>
                    <th>Industry</th>
                    <th>Location</th>
                    <th>Website</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {pendingCompanies.map((comp) => (
                    <tr key={comp._id}>
                      <td className="fw-bold text-dark">{comp.companyName || comp.user?.name || 'N/A'}</td>
                      <td>{comp.user?.email || 'N/A'}</td>
                      <td><span className="badge bg-light text-dark border">{comp.industry || 'IT Services'}</span></td>
                      <td>{comp.location || 'N/A'}</td>
                      <td>
                        {comp.website ? (
                          <a href={comp.website} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm py-0">
                            Visit Site
                          </a>
                        ) : 'N/A'}
                      </td>
                      <td className="text-end">
                        <button
                          onClick={() => handleCompanyStatus(comp.user?._id, 'Approved', comp.companyName || comp.user?.name)}
                          className="btn btn-success btn-sm me-2 fw-bold"
                        >
                          <i className="bi bi-check-circle me-1"></i> Approve
                        </button>
                        <button
                          onClick={() => handleCompanyStatus(comp.user?._id, 'Rejected', comp.companyName || comp.user?.name)}
                          className="btn btn-outline-danger btn-sm fw-bold"
                        >
                          <i className="bi bi-x-circle me-1"></i> Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="card border-0 shadow-sm rounded-3 p-4">
          <h5 className="fw-bold text-dark mb-3">Pending Job Posting Approvals</h5>
          {pendingJobs.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-check-circle-fill text-success fs-1 mb-2 d-block"></i>
              No job postings are pending approval.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small uppercase">
                  <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Salary Package</th>
                    <th>Eligibility</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {pendingJobs.map((job) => (
                    <tr key={job._id}>
                      <td className="fw-bold text-dark">{job.title}</td>
                      <td><span className="badge bg-primary-subtle text-primary">{job.companyName}</span></td>
                      <td>{job.location}</td>
                      <td className="text-success fw-bold">{job.salary}</td>
                      <td>{job.eligibility}</td>
                      <td className="text-end">
                        <button
                          onClick={() => handleJobStatus(job._id, 'Approved', job.title)}
                          className="btn btn-success btn-sm me-2 fw-bold"
                        >
                          <i className="bi bi-check-circle me-1"></i> Approve
                        </button>
                        <button
                          onClick={() => handleJobStatus(job._id, 'Rejected', job.title)}
                          className="btn btn-outline-danger btn-sm fw-bold"
                        >
                          <i className="bi bi-x-circle me-1"></i> Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit Job Modal */}
      <Modal
        isOpen={isEditJobModalOpen}
        onClose={() => setIsEditJobModalOpen(false)}
        title="Admin Edit: Placement Drive"
      >
        <form onSubmit={handleJobFormSubmit}>
          {jobFormError && <div className="alert alert-danger py-2 small">{jobFormError}</div>}

          <div className="mb-3">
            <label className="form-label fw-bold small text-secondary">Job Title *</label>
            <input
              type="text"
              className="form-control"
              value={jobFormData.title}
              onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
              required
            />
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-bold small text-secondary">Location *</label>
              <input
                type="text"
                className="form-control"
                value={jobFormData.location}
                onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold small text-secondary">Salary Package *</label>
              <input
                type="text"
                className="form-control"
                value={jobFormData.salary}
                onChange={(e) => setJobFormData({ ...jobFormData, salary: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-bold small text-secondary">Eligibility Criterion *</label>
              <input
                type="text"
                className="form-control"
                value={jobFormData.eligibility}
                onChange={(e) => setJobFormData({ ...jobFormData, eligibility: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold small text-secondary">Drive Status *</label>
              <select
                className="form-select"
                value={jobFormData.status}
                onChange={(e) => setJobFormData({ ...jobFormData, status: e.target.value })}
              >
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold small text-secondary">Job Description *</label>
            <textarea
              className="form-control"
              rows={4}
              value={jobFormData.description}
              onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
              required
            ></textarea>
          </div>

          <div className="d-flex justify-content-end gap-2 pt-3 border-top">
            <button type="button" onClick={() => setIsEditJobModalOpen(false)} className="btn btn-light fw-bold">
              Cancel
            </button>
            <button type="submit" disabled={jobSubmitting} className="btn btn-primary fw-bold">
              {jobSubmitting ? 'Saving...' : 'Save Job Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Recycle Bin Modal */}
      <RecycleBinModal
        isOpen={isTrashOpen}
        onClose={() => setIsTrashOpen(false)}
        onRefresh={fetchDashboardData}
      />
    </div>
  );
};

export default AdminDashboard;
