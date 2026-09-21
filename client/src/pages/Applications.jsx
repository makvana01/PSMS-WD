/**
 * APPLICATIONS TRACKER PAGE (Applications.jsx)
 * -------------------------------------------------------------
 * Connections:
 * - Route: '/applications'
 * - Protected: Admin, Student, Company
 * - API Calls:
 *   1. applicationService.js -> GET /api/applications/student/my-applications (Student)
 *   2. applicationService.js -> GET /api/applications/company/applicants (Company)
 *   3. applicationService.js -> GET /api/applications/admin/all (Admin)
 *   4. applicationService.js -> PUT /api/applications/:id/status
 */

import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  getStudentApplications,
  getCompanyApplicants,
  getAllApplicationsAdmin,
  updateApplicationStatus
} from '../services/applicationService';
import { exportToCSV } from '../utils/csvExport';
import { getFileUrl } from '../utils/fileUrl';

const Applications = () => {
  const { user } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadApplications = async () => {
    try {
      setLoading(true);
      let data = [];
      if (user.role === 'student') {
        data = await getStudentApplications();
      } else if (user.role === 'company') {
        data = await getCompanyApplicants();
      } else if (user.role === 'admin') {
        data = await getAllApplicationsAdmin();
      }
      setApplications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [user]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateApplicationStatus(appId, newStatus);
      setApplications((prev) =>
        prev.map((app) => (app._id === appId ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update application status.');
    }
  };

  const handleExportCSV = () => {
    let columns = [];
    if (user?.role === 'student') {
      columns = [
        { label: 'Job Title', accessor: (a) => a.job?.title || 'N/A' },
        { label: 'Company', accessor: (a) => a.job?.companyName || a.company?.name || 'N/A' },
        { label: 'Location', accessor: (a) => a.job?.location || 'N/A' },
        { label: 'Salary Package', accessor: (a) => a.job?.salary || 'N/A' },
        { label: 'Application Status', accessor: (a) => a.status },
        { label: 'Applied Date', accessor: (a) => (a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : '') }
      ];
    } else {
      columns = [
        { label: 'Job Title', accessor: (a) => a.job?.title || 'N/A' },
        { label: 'Company', accessor: (a) => a.job?.companyName || a.company?.name || 'N/A' },
        { label: 'Candidate Name', accessor: (a) => a.student?.name || 'N/A' },
        { label: 'Candidate Email', accessor: (a) => a.student?.email || 'N/A' },
        { label: 'Contact Phone', accessor: (a) => a.studentProfile?.phone || 'N/A' },
        { label: 'Department / Degree', accessor: (a) => a.studentProfile?.department || 'BCA' },
        { label: 'Passing Year', accessor: (a) => a.studentProfile?.passingYear || 2026 },
        { label: 'CGPA', accessor: (a) => (a.studentProfile?.cgpa ? Number(a.studentProfile.cgpa).toFixed(2) : '0.00') },
        { label: 'Technical Skills', accessor: (a) => (a.studentProfile?.skills ? a.studentProfile.skills.join('; ') : '') },
        { label: 'Application Status', accessor: (a) => a.status },
        { label: 'Applied Date', accessor: (a) => (a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : '') },
        { label: 'Resume PDF Link', accessor: (a) => (a.studentProfile?.resumeUrl ? getFileUrl(a.studentProfile.resumeUrl) : 'Not Uploaded') },
        { label: 'College ID Card Link', accessor: (a) => (a.studentProfile?.idCardUrl ? getFileUrl(a.studentProfile.idCardUrl) : 'Not Uploaded') }
      ];
    }
    const filename = user?.role === 'student' ? 'my_applications.csv' : 'placement_applicants_export.csv';
    exportToCSV(filteredApps, filename, columns);
  };

  const filteredApps = applications.filter((app) => {
    const term = search.toLowerCase();
    const studentName = app.student?.name?.toLowerCase() || '';
    const jobTitle = app.job?.title?.toLowerCase() || '';
    const companyName = app.job?.companyName?.toLowerCase() || app.company?.name?.toLowerCase() || '';

    const matchesSearch = studentName.includes(term) || jobTitle.includes(term) || companyName.includes(term);
    const matchesStatus = statusFilter ? app.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  const getBackPath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin-dashboard';
    if (user.role === 'company') return '/company-dashboard';
    return '/student-dashboard';
  };

  return (
    <div className="container py-4 space-y-4">
      {/* Back Button */}
      <Link to={getBackPath()} className="btn-back mb-3">
        <i className="bi bi-arrow-left"></i> Back to Dashboard
      </Link>

      {/* Header Card */}
      <div className="card border-0 shadow-sm rounded-3 p-4 mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h2 className="fw-bold text-dark mb-0">
              {user?.role === 'student' ? 'My Submitted Applications' : 'Placement Applications'}
            </h2>
            <small className="text-muted">
              {user?.role === 'student'
                ? 'Track your recruitment drive status'
                : 'Review candidate applications, view PDF resumes & update status'}
            </small>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <div className="input-group" style={{ maxWidth: '240px' }}>
              <span className="input-group-text bg-light"><i className="bi bi-search"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search candidate, job..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="form-select"
              style={{ maxWidth: '160px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Applied">Applied</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
            </select>

            <button
              onClick={handleExportCSV}
              className="btn btn-outline-success fw-bold shadow-sm"
              title="Export displayed applications to CSV"
            >
              <i className="bi bi-file-earmark-spreadsheet me-1"></i> Export to CSV
            </button>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="card border-0 shadow-sm rounded-3 p-4">
        {loading ? (
          <div className="text-center py-4 text-muted">Loading applications...</div>
        ) : filteredApps.length === 0 ? (
          <div className="text-center py-4 text-muted">No applications match the current filter.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small uppercase">
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  {user?.role !== 'student' && <th>Student Name</th>}
                  {user?.role !== 'student' && <th>Academic CGPA</th>}
                  {user?.role !== 'student' && <th>PDF Resume</th>}
                  <th>Applied Date</th>
                  <th>Status</th>
                  {(user?.role === 'company' || user?.role === 'admin') && (
                    <th className="text-end">Update Status</th>
                  )}
                </tr>
              </thead>
              <tbody className="small">
                {filteredApps.map((app) => (
                  <tr key={app._id}>
                    <td className="fw-bold text-dark">{app.job?.title || 'N/A'}</td>
                    <td>{app.job?.companyName || app.company?.name || 'N/A'}</td>

                    {user?.role !== 'student' && (
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {app.studentProfile?.profilePicUrl ? (
                            <img
                              src={getFileUrl(app.studentProfile.profilePicUrl)}
                              alt="Avatar"
                              className="rounded-circle border"
                              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center border fw-bold"
                              style={{ width: '40px', height: '40px', fontSize: '16px' }}
                            >
                              {(app.student?.name || 'S').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span className="fw-bold text-dark d-block mb-0">{app.student?.name || 'N/A'}</span>
                            <small className="text-muted d-block" style={{ fontSize: '11px', marginTop: '-3px' }}>{app.student?.email || ''}</small>
                          </div>
                        </div>
                      </td>
                    )}

                    {user?.role !== 'student' && (
                      <td>
                        <span className="fw-bold text-primary">{app.studentProfile?.cgpa ? `${app.studentProfile.cgpa} CGPA` : 'N/A'}</span>
                        <small className="text-muted d-block">{app.studentProfile?.department || 'BCA'}</small>
                      </td>
                    )}

                    {user?.role !== 'student' && (
                      <td>
                        <div className="d-flex flex-column gap-1">
                          {app.studentProfile?.resumeUrl ? (
                            <a
                              href={getFileUrl(app.studentProfile.resumeUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline-success btn-sm py-0 font-semibold"
                              title="View Candidate Resume PDF"
                            >
                              <i className="bi bi-file-earmark-pdf me-1"></i> Resume PDF
                            </a>
                          ) : (
                            <span className="badge bg-light text-muted border">No Resume</span>
                          )}

                          {app.studentProfile?.idCardUrl ? (
                            <a
                              href={getFileUrl(app.studentProfile.idCardUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline-primary btn-sm py-0 font-semibold"
                              title="View Candidate College ID Card"
                            >
                              <i className="bi bi-person-badge me-1"></i> College ID
                            </a>
                          ) : (
                            <span className="badge bg-light text-muted border">No ID Card</span>
                          )}
                        </div>
                      </td>
                    )}

                    <td className="text-muted">{new Date(app.appliedAt).toLocaleDateString()}</td>

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

                    {(user?.role === 'company' || user?.role === 'admin') && (
                      <td className="text-end">
                        <select
                          className="form-select form-select-sm d-inline-block w-auto"
                          value={app.status}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        >
                          <option value="Applied">Applied</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Selected">Selected</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;
