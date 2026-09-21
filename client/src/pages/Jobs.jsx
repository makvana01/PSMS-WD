/**
 * JOBS LIST PAGE (Jobs.jsx)
 * -------------------------------------------------------------
 * Connections:
 * - Route: '/jobs'
 * - API Calls:
 *   1. jobService.js -> GET /api/jobs (with search, location, status filters)
 *   2. applicationService.js -> POST /api/applications/apply/:jobId
 */

import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getJobs } from '../services/jobService';
import { applyForJob } from '../services/applicationService';

const Jobs = () => {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('');

  const [appliedJobs, setAppliedJobs] = useState({});
  const [applyingId, setApplyingId] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await getJobs(search, location, status);
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search, location, status]);

  const handleApply = async (jobId) => {
    if (!user) {
      alert('Please log in as a student to apply.');
      return;
    }
    if (user.role !== 'student') {
      alert('Only registered students can apply for placement jobs.');
      return;
    }

    try {
      setApplyingId(jobId);
      await applyForJob(jobId);
      setAppliedJobs({ ...appliedJobs, [jobId]: true });
      alert('Application submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply for job.');
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="container py-4 space-y-4">
      {/* Header & Filter Card */}
      <div className="card border-0 shadow-sm rounded-3 p-4 mb-4">
        <h2 className="fw-bold text-dark mb-1">Explore Placement Openings</h2>
        <p className="text-muted small mb-3">Find verified campus jobs matching your eligibility</p>

        {/* Filter controls */}
        <div className="row g-3">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light"><i className="bi bi-search"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search job title or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-light"><i className="bi bi-geo-alt"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Filter by location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Job Statuses</option>
              <option value="Open">Open Only</option>
              <option value="Closed">Closed Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Cards Grid */}
      {loading ? (
        <div className="text-center py-5 text-muted">Fetching active placement jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="card border-0 shadow-sm p-5 text-center">
          <i className="bi bi-briefcase text-muted fs-1 mb-2"></i>
          <h5 className="fw-bold text-dark">No jobs match your search criteria</h5>
          <p className="text-muted small">Try adjusting keywords or clearing location filters.</p>
        </div>
      ) : (
        <div className="row g-4">
          {jobs.map((job) => (
            <div key={job._id} className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm rounded-3 p-3 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-primary bg-opacity-10 text-primary fw-bold">
                      {job.companyName}
                    </span>
                    <span className={`badge ${job.status === 'Open' ? 'bg-success' : 'bg-secondary'}`}>
                      {job.status}
                    </span>
                  </div>

                  <h5 className="fw-bold text-dark mb-2">{job.title}</h5>

                  <div className="small text-muted mb-2">
                    <div><i className="bi bi-geo-alt me-1 text-secondary"></i> {job.location}</div>
                    <div className="text-success fw-bold"><i className="bi bi-currency-rupee me-1"></i> {job.salary}</div>
                    <div><i className="bi bi-calendar-event me-1 text-secondary"></i> Apply by {new Date(job.lastDate).toLocaleDateString()}</div>
                  </div>

                  <div className="bg-light p-2 rounded border mb-3 small">
                    <small className="fw-bold text-secondary d-block">ELIGIBILITY</small>
                    <span className="text-dark fw-semibold">{job.eligibility}</span>
                  </div>
                </div>

                <div className="pt-2 border-top d-flex justify-content-between align-items-center">
                  <Link to={`/jobs/${job._id}`} className="btn btn-outline-primary btn-sm fw-bold">
                    View Details &rarr;
                  </Link>

                  {user?.role === 'student' && (
                    <button
                      onClick={() => handleApply(job._id)}
                      disabled={appliedJobs[job._id] || applyingId === job._id || job.status === 'Closed'}
                      className={`btn btn-sm fw-bold ${
                        appliedJobs[job._id] ? 'btn-success' : job.status === 'Closed' ? 'btn-secondary' : 'btn-primary'
                      }`}
                    >
                      {appliedJobs[job._id] ? 'Applied' : applyingId === job._id ? 'Applying...' : 'Apply Now'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Jobs;
