/**
 * JOB DETAIL PAGE (JobDetail.jsx)
 * -------------------------------------------------------------
 * Connections:
 * - Route: '/jobs/:id'
 * - API Calls:
 *   1. jobService.js -> GET /api/jobs/:id
 *   2. applicationService.js -> POST /api/applications/apply/:id
 */

import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getJobById } from '../services/jobService';
import { applyForJob } from '../services/applicationService';
import Modal from '../components/Modal';

const JobDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Incomplete profile modal state
  const [incompleteModalOpen, setIncompleteModalOpen] = useState(false);
  const [incompleteMessage, setIncompleteMessage] = useState('');
  const [missingItems, setMissingItems] = useState([]);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await getJobById(id);
        setJob(data);
      } catch (err) {
        setError('Job post not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'student') {
      alert('Only students can apply for campus placement drives.');
      return;
    }

    try {
      setApplying(true);
      setError('');
      setSuccessMsg('');
      await applyForJob(id);
      setApplied(true);
      setSuccessMsg('🎉 Application submitted successfully! You can track its status under My Applications.');
    } catch (err) {
      if (err.response?.data?.incompleteProfile) {
        setIncompleteMessage(err.response.data.message || 'Please complete your student profile first.');
        setMissingItems(err.response.data.missingList || ['Resume (PDF)', 'College ID Card']);
        setIncompleteModalOpen(true);
      } else {
        setError(err.response?.data?.message || 'Failed to apply for job.');
      }
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <div className="text-center py-5 text-muted">Loading job details...</div>;
  }

  if (error && !job) {
    return (
      <div className="card border-0 shadow-sm p-4 text-center mx-auto my-5" style={{ maxWidth: '500px' }}>
        <p className="text-danger fw-bold">{error || 'Job post not found.'}</p>
        <Link to="/jobs" className="btn btn-primary btn-sm fw-bold">Back to Jobs List</Link>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: '900px' }}>
      <Link to="/jobs" className="btn btn-outline-secondary btn-sm mb-3">
        &larr; Back to Openings
      </Link>

      {successMsg && <div className="alert alert-success py-2 mb-3 shadow-sm">{successMsg}</div>}
      {error && <div className="alert alert-danger py-2 mb-3 shadow-sm">{error}</div>}

      <div className="card border-0 shadow-sm rounded-3 p-4">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-3 border-bottom mb-4">
          <div>
            <span className="badge bg-primary bg-opacity-10 text-primary fw-bold mb-2">
              <i className="bi bi-building me-1"></i> {job.companyName}
            </span>
            <h2 className="fw-bold text-dark mb-1">{job.title}</h2>
            <div className="d-flex flex-wrap gap-3 text-muted small">
              <span><i className="bi bi-geo-alt me-1"></i> {job.location}</span>
              <span className="text-success fw-bold"><i className="bi bi-currency-rupee me-1"></i> {job.salary}</span>
              <span><i className="bi bi-calendar-event me-1"></i> Apply by: {new Date(job.lastDate).toLocaleDateString()}</span>
            </div>
          </div>

          {user?.role === 'student' && (
            <button
              onClick={handleApply}
              disabled={applied || applying || job.status === 'Closed'}
              className={`btn btn-lg fw-bold ${
                applied ? 'btn-success' : job.status === 'Closed' ? 'btn-secondary' : 'btn-primary'
              }`}
            >
              {applied ? 'Applied' : applying ? 'Submitting...' : 'Apply for Position'}
            </button>
          )}
        </div>

        {/* Eligibility Callout */}
        <div className="alert alert-warning border-warning d-flex align-items-center gap-2 mb-4" role="alert">
          <i className="bi bi-award-fill fs-4 text-warning"></i>
          <div>
            <strong className="d-block text-dark uppercase small">Eligibility Criterion</strong>
            <span className="text-dark small fw-semibold">{job.eligibility}</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h5 className="fw-bold text-dark mb-2">Job Description & Responsibilities</h5>
          <div className="bg-light p-3 rounded border text-secondary small leading-relaxed whitespace-pre-line">
            {job.description}
          </div>
        </div>
      </div>

      {/* Incomplete Profile Modal Guard */}
      <Modal
        isOpen={incompleteModalOpen}
        onClose={() => setIncompleteModalOpen(false)}
        title="Compulsory Profile Information Required"
      >
        <div className="text-center py-2">
          <i className="bi bi-exclamation-triangle-fill text-warning fs-1 mb-2 d-block"></i>
          <h5 className="fw-bold text-dark mb-2">Complete Your Profile to Apply</h5>
          <p className="text-muted small mb-3">
            {incompleteMessage}
          </p>

          {missingItems.length > 0 && (
            <div className="text-start bg-light p-3 rounded-3 border mb-3 small">
              <strong className="text-danger d-block mb-1">Missing Compulsory Information:</strong>
              <ul className="mb-0 ps-3">
                {missingItems.map((item, idx) => (
                  <li key={idx} className="text-dark fw-semibold">{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="d-flex justify-content-end gap-2 pt-2 border-top">
            <button
              type="button"
              onClick={() => setIncompleteModalOpen(false)}
              className="btn btn-light btn-sm fw-bold"
            >
              Close
            </button>
            <Link
              to="/profile"
              className="btn btn-primary btn-sm fw-bold"
            >
              <i className="bi bi-person-gear me-1"></i> Go to Profile & Complete Now
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default JobDetail;
