/**
 * HOME LANDING PAGE (Home.jsx)
 * -------------------------------------------------------------
 * Connections:
 * - Route: '/'
 * - API Call: jobService.js -> GET /api/jobs
 * - Displays platform features and active recruitment drives
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getJobs } from '../services/jobService';

const Home = () => {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeJobs = async () => {
      try {
        const data = await getJobs('', '', 'Open');
        setFeaturedJobs(data.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeJobs();
  }, []);

  return (
    <div className="container py-4 space-y-5">
      {/* Hero Section */}
      <div className="p-5 mb-4 bg-primary text-white rounded-3 shadow">
        <div className="container-fluid py-3">
          <span className="badge bg-light text-primary fw-bold mb-3 p-2">
            <i className="bi bi-award-fill text-warning me-1"></i> BCA Sem 5 AWD Project
          </span>

          <h1 className="display-5 fw-bold">Smart Campus Placement Management System</h1>
          <p className="col-md-10 fs-5 font-light my-3">
            Connecting ambitious students with top campus recruiters. Manage job posts, candidate profiles, PDF resumes, application statuses, and placement analytics in one simple system.
          </p>

          <div className="d-flex flex-wrap gap-3 mt-4">
            <Link to="/register" className="btn btn-warning btn-lg fw-bold shadow-sm">
              Get Started Free <i className="bi bi-arrow-right ms-1"></i>
            </Link>
            <Link to="/jobs" className="btn btn-outline-light btn-lg fw-semibold">
              <i className="bi bi-search me-1"></i> Explore Jobs
            </Link>
          </div>
        </div>
      </div>

      {/* Role Features */}
      <div className="row text-center mb-4">
        <div className="col-12 mb-3">
          <h2 className="fw-bold text-dark">Designed for Every Campus Role</h2>
          <p className="text-muted">Simple dashboards for Administrators, Students, and Corporate Recruiters.</p>
        </div>
      </div>

      <div className="row g-4 mb-5">
        {/* Admin Role Card */}
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm rounded-3 p-3">
            <div className="card-body">
              <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-3 d-inline-block mb-3">
                <i className="bi bi-shield-check fs-2"></i>
              </div>
              <h5 className="card-title fw-bold text-dark">College Admin</h5>
              <p className="card-text text-muted small">
                Complete oversight of student profiles, company registrations, placement drives, and system metrics.
              </p>
              <ul className="list-unstyled text-start small space-y-2 mt-3">
                <li><i className="bi bi-check-circle-fill text-success me-2"></i>Dashboard Analytics</li>
                <li><i className="bi bi-check-circle-fill text-success me-2"></i>Manage Student & Company Accounts</li>
                <li><i className="bi bi-check-circle-fill text-success me-2"></i>Global Placement Applications</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Student Role Card */}
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm rounded-3 p-3">
            <div className="card-body">
              <div className="bg-success bg-opacity-10 text-success p-3 rounded-3 d-inline-block mb-3">
                <i className="bi bi-people-fill fs-2"></i>
              </div>
              <h5 className="card-title fw-bold text-dark">Students</h5>
              <p className="card-text text-muted small">
                Build your profile, upload PDF resumes, search verified job opportunities, and track application statuses.
              </p>
              <ul className="list-unstyled text-start small space-y-2 mt-3">
                <li><i className="bi bi-check-circle-fill text-success me-2"></i>Profile & PDF Resume Upload</li>
                <li><i className="bi bi-check-circle-fill text-success me-2"></i>One-Click Job Application</li>
                <li><i className="bi bi-check-circle-fill text-success me-2"></i>Live Status Updates</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Company Role Card */}
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm rounded-3 p-3">
            <div className="card-body">
              <div className="bg-purple bg-opacity-10 text-primary p-3 rounded-3 d-inline-block mb-3">
                <i className="bi bi-building fs-2"></i>
              </div>
              <h5 className="card-title fw-bold text-dark">Companies</h5>
              <p className="card-text text-muted small">
                Post placement openings, review candidate CGPA & skills, download resumes, and manage interview shortlists.
              </p>
              <ul className="list-unstyled text-start small space-y-2 mt-3">
                <li><i className="bi bi-check-circle-fill text-success me-2"></i>Post & Edit Placement Jobs</li>
                <li><i className="bi bi-check-circle-fill text-success me-2"></i>Review Candidate Resumes</li>
                <li><i className="bi bi-check-circle-fill text-success me-2"></i>Shortlist & Select Candidates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Jobs Section */}
      <div className="card border-0 shadow-sm rounded-3 p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="fw-bold text-dark mb-0">Latest Placement Openings</h4>
            <small className="text-muted">Active recruitment drives on campus</small>
          </div>
          <Link to="/jobs" className="btn btn-outline-primary btn-sm fw-bold">
            View All Jobs &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-4 text-muted">Loading open jobs...</div>
        ) : featuredJobs.length === 0 ? (
          <div className="text-center py-4 text-muted">No open jobs found.</div>
        ) : (
          <div className="row g-3">
            {featuredJobs.map((job) => (
              <div key={job._id} className="col-md-4">
                <div className="card h-100 border bg-light rounded-3 p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-primary bg-opacity-10 text-primary fw-bold">
                      {job.companyName}
                    </span>
                    <span className="badge bg-success">{job.salary}</span>
                  </div>
                  <h5 className="fw-bold text-dark mb-1">{job.title}</h5>
                  <p className="text-secondary small mb-2"><i className="bi bi-geo-alt me-1"></i>{job.location}</p>
                  <div className="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
                    <small className="text-muted">Deadline: {new Date(job.lastDate).toLocaleDateString()}</small>
                    <Link to={`/jobs/${job._id}`} className="btn btn-sm btn-primary">
                      Details &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
