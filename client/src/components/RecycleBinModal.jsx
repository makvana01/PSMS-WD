import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { getTrashRecordsAdmin, restoreRecordAdmin, hardDeleteRecordAdmin } from '../services/adminService';

const RecycleBinModal = ({ isOpen, onClose, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('students');
  const [trashData, setTrashData] = useState({ students: [], companies: [], jobs: [] });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadTrash = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getTrashRecordsAdmin();
      setTrashData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load recycle bin records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadTrash();
      setMessage('');
      setError('');
    }
  }, [isOpen]);

  const handleRestore = async (type, id, title) => {
    if (window.confirm(`Restore '${title}' back to the active website?`)) {
      try {
        setActionLoading(true);
        setMessage('');
        setError('');
        const res = await restoreRecordAdmin(type, id);
        setMessage(res.message || 'Item restored to active website successfully!');
        loadTrash();
        if (onRefresh) onRefresh();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to restore item.');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleHardDelete = async (type, id, title) => {
    if (window.confirm(`⚠️ PERMANENT HARD DELETE WARNING:\n\nAre you sure you want to permanently delete '${title}' from the database?\nThis action CANNOT be undone and all associated records will be permanently wiped.`)) {
      try {
        setActionLoading(true);
        setMessage('');
        setError('');
        const res = await hardDeleteRecordAdmin(type, id);
        setMessage(res.message || 'Item permanently deleted from database.');
        loadTrash();
        if (onRefresh) onRefresh();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to permanently delete item.');
      } finally {
        setActionLoading(false);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Recycle Bin (Soft-Deleted Records)">
      <div className="space-y-3">
        <p className="text-muted small mb-3">
          Items deleted from the website are stored here. You can <strong>Restore</strong> them to make them visible again or perform a permanent <strong>Hard Delete</strong>.
        </p>

        {message && <div className="alert alert-success py-2 small">{message}</div>}
        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        {/* Tab Buttons */}
        <div className="d-flex gap-2 border-bottom pb-2 mb-3">
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'students' ? 'btn-primary' : 'btn-outline-secondary'} fw-bold`}
            onClick={() => setActiveTab('students')}
          >
            <i className="bi bi-people me-1"></i> Students
            <span className="badge bg-light text-dark ms-2">{trashData.students.length}</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'companies' ? 'btn-primary' : 'btn-outline-secondary'} fw-bold`}
            onClick={() => setActiveTab('companies')}
          >
            <i className="bi bi-building me-1"></i> Companies
            <span className="badge bg-light text-dark ms-2">{trashData.companies.length}</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'jobs' ? 'btn-primary' : 'btn-outline-secondary'} fw-bold`}
            onClick={() => setActiveTab('jobs')}
          >
            <i className="bi bi-briefcase me-1"></i> Placement Drives
            <span className="badge bg-light text-dark ms-2">{trashData.jobs.length}</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-4 text-muted">Loading trash bin records...</div>
        ) : (
          <div>
            {/* STUDENTS TAB */}
            {activeTab === 'students' && (
              trashData.students.length === 0 ? (
                <div className="text-center py-4 text-muted bg-light rounded-3 border">
                  <i className="bi bi-trash3 fs-3 d-block mb-1 text-secondary"></i>
                  No soft-deleted students in the recycle bin.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0 small">
                    <thead className="table-light uppercase">
                      <tr>
                        <th>Student Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Deleted At</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trashData.students.map((st) => (
                        <tr key={st._id}>
                          <td className="fw-bold">{st.user?.name || 'Student'}</td>
                          <td>{st.user?.email || 'N/A'}</td>
                          <td><span className="badge bg-light text-dark border">{st.department || 'BCA'}</span></td>
                          <td className="text-muted">{st.deletedAt ? new Date(st.deletedAt).toLocaleDateString() : 'Recently'}</td>
                          <td className="text-end">
                            <button
                              disabled={actionLoading}
                              onClick={() => handleRestore('student', st.user?._id || st.user, st.user?.name || 'Student')}
                              className="btn btn-outline-success btn-sm me-2 fw-bold"
                              title="Restore student to active website"
                            >
                              <i className="bi bi-arrow-counterclockwise me-1"></i> Restore
                            </button>
                            <button
                              disabled={actionLoading}
                              onClick={() => handleHardDelete('student', st.user?._id || st.user, st.user?.name || 'Student')}
                              className="btn btn-outline-danger btn-sm fw-bold"
                              title="Permanently remove student from database"
                            >
                              <i className="bi bi-trash3-fill"></i> Hard Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* COMPANIES TAB */}
            {activeTab === 'companies' && (
              trashData.companies.length === 0 ? (
                <div className="text-center py-4 text-muted bg-light rounded-3 border">
                  <i className="bi bi-trash3 fs-3 d-block mb-1 text-secondary"></i>
                  No soft-deleted companies in the recycle bin.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0 small">
                    <thead className="table-light uppercase">
                      <tr>
                        <th>Company Name</th>
                        <th>Email</th>
                        <th>Industry</th>
                        <th>Deleted At</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trashData.companies.map((cp) => (
                        <tr key={cp._id}>
                          <td className="fw-bold">{cp.companyName || cp.user?.name || 'Company'}</td>
                          <td>{cp.user?.email || 'N/A'}</td>
                          <td><span className="badge bg-light text-dark border">{cp.industry || 'IT'}</span></td>
                          <td className="text-muted">{cp.deletedAt ? new Date(cp.deletedAt).toLocaleDateString() : 'Recently'}</td>
                          <td className="text-end">
                            <button
                              disabled={actionLoading}
                              onClick={() => handleRestore('company', cp.user?._id || cp.user, cp.companyName || cp.user?.name || 'Company')}
                              className="btn btn-outline-success btn-sm me-2 fw-bold"
                              title="Restore company to active website"
                            >
                              <i className="bi bi-arrow-counterclockwise me-1"></i> Restore
                            </button>
                            <button
                              disabled={actionLoading}
                              onClick={() => handleHardDelete('company', cp.user?._id || cp.user, cp.companyName || cp.user?.name || 'Company')}
                              className="btn btn-outline-danger btn-sm fw-bold"
                              title="Permanently remove company from database"
                            >
                              <i className="bi bi-trash3-fill"></i> Hard Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* JOBS TAB */}
            {activeTab === 'jobs' && (
              trashData.jobs.length === 0 ? (
                <div className="text-center py-4 text-muted bg-light rounded-3 border">
                  <i className="bi bi-trash3 fs-3 d-block mb-1 text-secondary"></i>
                  No soft-deleted placement drives in the recycle bin.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0 small">
                    <thead className="table-light uppercase">
                      <tr>
                        <th>Job Title</th>
                        <th>Company</th>
                        <th>Location</th>
                        <th>Deleted At</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trashData.jobs.map((jb) => (
                        <tr key={jb._id}>
                          <td className="fw-bold">{jb.title}</td>
                          <td>{jb.companyName}</td>
                          <td>{jb.location}</td>
                          <td className="text-muted">{jb.deletedAt ? new Date(jb.deletedAt).toLocaleDateString() : 'Recently'}</td>
                          <td className="text-end">
                            <button
                              disabled={actionLoading}
                              onClick={() => handleRestore('job', jb._id, jb.title)}
                              className="btn btn-outline-success btn-sm me-2 fw-bold"
                              title="Restore job to active website"
                            >
                              <i className="bi bi-arrow-counterclockwise me-1"></i> Restore
                            </button>
                            <button
                              disabled={actionLoading}
                              onClick={() => handleHardDelete('job', jb._id, jb.title)}
                              className="btn btn-outline-danger btn-sm fw-bold"
                              title="Permanently delete job from database"
                            >
                              <i className="bi bi-trash3-fill"></i> Hard Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        )}

        <div className="d-flex justify-content-end pt-3 border-top mt-3">
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm fw-bold">
            Close Recycle Bin
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RecycleBinModal;
