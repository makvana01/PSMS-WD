/**
 * MANAGE STUDENTS PAGE (ManageStudents.jsx)
 * -------------------------------------------------------------
 * Connections:
 * - Route: '/manage-students'
 * - Protected: Admin role only
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllStudentsAdmin, deleteStudentAdmin, updateStudentDetailsAdmin, toggleStudentStatusAdmin } from '../services/studentService';
import Modal from '../components/Modal';
import RecycleBinModal from '../components/RecycleBinModal';
import { validateName, validateIndianPhone, validateCGPA, validatePassingYear } from '../utils/validators';
import { exportToCSV } from '../utils/csvExport';
import { getFileUrl } from '../utils/fileUrl';



const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  // Modal and Edit Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    department: 'BCA',
    passingYear: 2026,
    cgpa: '',
    skills: '',
    bio: '',
    status: 'Active'
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await getAllStudentsAdmin();
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Move student '${name}' to the Recycle Bin (Soft Delete)?\nYou can restore this account anytime from the Recycle Bin.`)) {
      try {
        await deleteStudentAdmin(id);
        setActionMessage(`Student '${name}' moved to Recycle Bin.`);
        loadStudents();
        setTimeout(() => setActionMessage(''), 4000);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete student.');
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus, name) => {
    const nextStatus = currentStatus === 'Deactive' ? 'Active' : 'Deactive';
    if (window.confirm(`Change status of '${name}' to ${nextStatus}?`)) {
      try {
        await toggleStudentStatusAdmin(id, nextStatus);
        setActionMessage(`Student status updated to ${nextStatus}.`);
        loadStudents();
        setTimeout(() => setActionMessage(''), 4000);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to update student status.');
      }
    }
  };

  const handleEditClick = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.user?.name || '',
      phone: student.phone || '',
      department: student.department || 'BCA',
      passingYear: student.passingYear || 2026,
      cgpa: student.cgpa !== undefined && student.cgpa !== null ? student.cgpa : '',
      skills: student.skills ? student.skills.join(', ') : '',
      bio: student.bio || '',
      status: student.user?.status || student.status || 'Active'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const nameCheck = validateName(formData.name);
    if (!nameCheck.isValid) {
      setFormError(nameCheck.message);
      return;
    }

    const phoneCheck = validateIndianPhone(formData.phone);
    if (!phoneCheck.isValid) {
      setFormError(phoneCheck.message);
      return;
    }

    if (!formData.department || !formData.department.trim()) {
      setFormError('Department is required.');
      return;
    }

    const cgpaCheck = validateCGPA(formData.cgpa);
    if (!cgpaCheck.isValid) {
      setFormError(cgpaCheck.message);
      return;
    }

    const yearCheck = validatePassingYear(formData.passingYear);
    if (!yearCheck.isValid) {
      setFormError(yearCheck.message);
      return;
    }

    if (!formData.skills || !formData.skills.trim()) {
      setFormError('At least one technical skill is required.');
      return;
    }

    if (!formData.bio || formData.bio.trim().length < 5) {
      setFormError('Bio must be at least 5 characters long.');
      return;
    }

    try {
      setSubmitting(true);
      const targetUserId = editingStudent.user?._id || editingStudent.user || editingStudent._id;
      await updateStudentDetailsAdmin(targetUserId, {
        ...formData,
        name: formData.name.trim(),
        phone: phoneCheck.cleaned || formData.phone.trim()
      });
      setIsModalOpen(false);
      setActionMessage('Student profile updated successfully!');
      loadStudents();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update student.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter(s =>
    (s.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.user?.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.department || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.skills || []).some(k => k.toLowerCase().includes(search.toLowerCase()))
  );

  const handleExportCSV = () => {
    const columns = [
      { label: 'Student Name', accessor: (s) => s.user?.name || 'N/A' },
      { label: 'Email', accessor: (s) => s.user?.email || 'N/A' },
      { label: 'Mobile Number', accessor: (s) => s.phone || 'N/A' },
      { label: 'Department', accessor: (s) => s.department || 'BCA' },
      { label: 'Passing Year', accessor: (s) => s.passingYear || 2026 },
      { label: 'CGPA Score', accessor: (s) => (s.cgpa !== undefined && s.cgpa !== null ? Number(s.cgpa).toFixed(2) : '0.00') },
      { label: 'Technical Skills', accessor: (s) => (s.skills ? s.skills.join('; ') : '') },
      { label: 'Bio', accessor: (s) => s.bio || '' },
      { label: 'Account Status', accessor: (s) => s.user?.status || s.status || 'Active' },
      { label: 'Resume Document Link', accessor: (s) => (s.resumeUrl ? getFileUrl(s.resumeUrl) : 'Not Uploaded') },
      { label: 'College ID Card Link', accessor: (s) => (s.idCardUrl ? getFileUrl(s.idCardUrl) : 'Not Uploaded') },
      { label: 'Registered Date', accessor: (s) => (s.user?.createdAt ? new Date(s.user.createdAt).toLocaleDateString() : '') }
    ];
    exportToCSV(filteredStudents, `students_export_${new Date().toISOString().split('T')[0]}.csv`, columns);
  };

  return (
    <div className="container py-4 space-y-4">
      {/* Header Banner */}
      <div className="card border-0 shadow-sm rounded-3 p-4 mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <Link to="/admin-dashboard" className="btn-back mb-2">
              <i className="bi bi-arrow-left"></i> Back to Dashboard
            </Link>
            <h2 className="fw-bold text-dark mb-0">Manage Registered Students</h2>
            <small className="text-muted">Direct control over active students, credentials, resumes, ID cards & account status</small>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="btn btn-outline-success btn-sm fw-bold shadow-sm"
              title="Export filtered students to CSV"
            >
              <i className="bi bi-file-earmark-spreadsheet me-1"></i> Export to CSV
            </button>
            <button
              type="button"
              onClick={() => setIsTrashOpen(true)}
              className="btn btn-outline-danger btn-sm fw-bold shadow-sm"
            >
              <i className="bi bi-trash3 me-1"></i> Recycle Bin / Trash
            </button>
            <button onClick={loadStudents} className="btn btn-outline-secondary btn-sm fw-bold">
              <i className="bi bi-arrow-clockwise me-1"></i> Refresh
            </button>
          </div>
        </div>
      </div>

      {actionMessage && <div className="alert alert-success py-2 small shadow-sm">{actionMessage}</div>}

      {/* Main Student Directory Table Card */}
      <div className="card border-0 shadow-sm rounded-3 p-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h5 className="fw-bold text-dark mb-0">Active Student Directory</h5>
            <small className="text-muted">{filteredStudents.length} candidate profiles available</small>
          </div>

          <div className="w-100 w-md-auto" style={{ maxWidth: '320px' }}>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search by name, email, skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5 text-muted">Loading students...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-5 text-muted">No student profiles found matching your search.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 small">
              <thead className="table-light uppercase">
                <tr>
                  <th>Student Info</th>
                  <th>Department & Year</th>
                  <th>CGPA</th>
                  <th>Status</th>
                  <th>Resume PDF</th>
                  <th>College ID Card</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const studentStatus = student.user?.status || student.status || 'Active';
                  return (
                    <tr key={student._id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              background: '#e9ecef',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              overflow: 'hidden'
                            }}
                          >
                            {student.profilePicUrl ? (
                              <img src={getFileUrl(student.profilePicUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              (student.user?.name || 'S').charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <span className="fw-bold text-dark d-block">{student.user?.name || 'Student'}</span>
                            <small className="text-muted">{student.user?.email}</small>
                            {student.phone && <div className="text-muted" style={{ fontSize: '0.75rem' }}>📞 {student.phone}</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border mb-1">{student.department || 'BCA'}</span>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>Passout: {student.passingYear || 2026}</div>
                      </td>
                      <td>
                        <span className="fw-bold text-primary">{student.cgpa ? Number(student.cgpa).toFixed(2) : '0.00'}</span>
                      </td>
                      <td>
                        <span className={`badge ${studentStatus === 'Active' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning border border-warning'} fw-bold mb-1 d-inline-block`}>
                          {studentStatus === 'Active' ? 'Active' : 'Deactive (Pending)'}
                        </span>
                        {studentStatus === 'Active' ? (
                          <button
                            onClick={() => handleToggleStatus(student.user?._id || student.user || student._id, studentStatus, student.user?.name || 'Student')}
                            className="btn btn-link btn-sm p-0 d-block text-danger text-decoration-none"
                            style={{ fontSize: '0.75rem' }}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(student.user?._id || student.user || student._id, studentStatus, student.user?.name || 'Student')}
                            className="btn btn-success btn-sm py-0 px-2 d-block fw-bold shadow-sm"
                            style={{ fontSize: '0.75rem' }}
                          >
                            <i className="bi bi-check-circle me-1"></i> Activate
                          </button>
                        )}
                      </td>
                      <td>
                        {student.resumeUrl ? (
                          <a
                            href={getFileUrl(student.resumeUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-success btn-sm py-0 font-semibold"
                            title="View Resume PDF"
                          >
                            <i className="bi bi-file-earmark-pdf me-1"></i> PDF
                          </a>
                        ) : (
                          <span className="badge bg-light text-muted border">Missing</span>
                        )}
                      </td>
                      <td>
                        {student.idCardUrl ? (
                          <a
                            href={getFileUrl(student.idCardUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-primary btn-sm py-0 font-semibold"
                            title="View College ID Card"
                          >
                            <i className="bi bi-person-badge me-1"></i> I-Card
                          </a>
                        ) : (
                          <span className="badge bg-light text-muted border">Missing</span>
                        )}
                      </td>
                      <td className="text-end">
                        <button
                          onClick={() => handleEditClick(student)}
                          className="btn btn-outline-primary btn-sm me-2"
                          title="Edit Student Profile Details"
                        >
                          <i className="bi bi-pencil"></i> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(student.user?._id || student.user || student._id, student.user?.name || 'Student')}
                          className="btn btn-outline-danger btn-sm"
                          title="Move to Recycle Bin (Soft Delete)"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Admin Edit: Student Profile"
      >
        <form onSubmit={handleFormSubmit}>
          {formError && <div className="alert alert-danger py-2 small">{formError}</div>}

          <div className="mb-3">
            <label className="form-label fw-bold small text-secondary">Student Full Name (A-Z Only) *</label>
            <input
              type="text"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-bold small text-secondary">Indian Mobile Number *</label>
              <input
                type="tel"
                className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold small text-secondary">Account Status *</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Deactive">Deactive</option>
              </select>
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-bold small text-secondary">Department / Degree *</label>
              <select
                className="form-select"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              >
                <option value="BCA">Bachelor of Computer Applications (BCA)</option>
                <option value="MCA">Master of Computer Applications (MCA)</option>
                <option value="B.Tech CS">B.Tech Computer Science</option>
                <option value="B.Sc IT">B.Sc Information Technology</option>
                <option value="Other">Other Degree</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold small text-secondary">Passing Year (2000-2035) *</label>
              <input
                type="number"
                min="2000"
                max="2035"
                className="form-control"
                value={formData.passingYear}
                onChange={(e) => setFormData({ ...formData, passingYear: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold small text-secondary">CGPA Score (0.0 - 10.0) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              className="form-control"
              value={formData.cgpa}
              onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold small text-secondary">Technical Skills (Comma Separated) *</label>
            <input
              type="text"
              className="form-control"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold small text-secondary">Short Bio / Career Summary *</label>
            <textarea
              className="form-control"
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              required
            ></textarea>
          </div>

          <div className="d-flex justify-content-end gap-2 pt-3 border-top">
            <button type="button" onClick={handleCloseModal} className="btn btn-light fw-bold">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary fw-bold">
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Recycle Bin Modal */}
      <RecycleBinModal
        isOpen={isTrashOpen}
        onClose={() => setIsTrashOpen(false)}
        onRefresh={loadStudents}
      />
    </div>
  );
};

export default ManageStudents;
