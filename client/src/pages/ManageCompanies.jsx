/**
 * MANAGE COMPANIES PAGE (ManageCompanies.jsx)
 * -------------------------------------------------------------
 * Connections:
 * - Route: '/manage-companies'
 * - Protected: Admin role only
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllCompaniesAdmin, deleteCompanyAdmin, updateCompanyDetailsAdmin, toggleCompanyStatusAdmin } from '../services/companyService';
import Modal from '../components/Modal';
import RecycleBinModal from '../components/RecycleBinModal';
import { validateIndianPhone, validateWebsite } from '../utils/validators';
import { exportToCSV } from '../utils/csvExport';


const ManageCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  // Modal and Edit Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    website: '',
    location: '',
    phone: '',
    description: '',
    status: 'Approved'
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await getAllCompaniesAdmin();
      setCompanies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Move company '${name}' to the Recycle Bin (Soft Delete)?\nYou can restore this company anytime from the Recycle Bin.`)) {
      try {
        await deleteCompanyAdmin(id);
        setActionMessage(`Company '${name}' moved to Recycle Bin.`);
        loadCompanies();
        setTimeout(() => setActionMessage(''), 4000);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete company.');
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus, name) => {
    const nextStatus = currentStatus === 'Deactive' ? 'Active' : 'Deactive';
    if (window.confirm(`Change status of '${name}' to ${nextStatus}?`)) {
      try {
        await toggleCompanyStatusAdmin(id, nextStatus);
        setActionMessage(`Company status updated to ${nextStatus}.`);
        loadCompanies();
        setTimeout(() => setActionMessage(''), 4000);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to update company status.');
      }
    }
  };

  const handleEditClick = (company) => {
    setEditingCompany(company);
    setFormData({
      companyName: company.companyName || company.user?.name || '',
      industry: company.industry || 'Information Technology',
      website: company.website || '',
      location: company.location || '',
      phone: company.phone || '',
      description: company.description || '',
      status: company.status || 'Approved'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCompany(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.companyName || !formData.companyName.trim()) {
      setFormError('Company name is required.');
      return;
    }

    if (!formData.industry || !formData.industry.trim()) {
      setFormError('Industry sector is required.');
      return;
    }

    if (!formData.location || !formData.location.trim()) {
      setFormError('Location is required.');
      return;
    }

    const websiteCheck = validateWebsite(formData.website);
    if (!websiteCheck.isValid) {
      setFormError(websiteCheck.message);
      return;
    }

    const phoneCheck = validateIndianPhone(formData.phone);
    if (!phoneCheck.isValid) {
      setFormError(phoneCheck.message);
      return;
    }

    if (!formData.description || formData.description.trim().length < 10) {
      setFormError('Company description must be at least 10 characters long.');
      return;
    }

    try {
      setSubmitting(true);
      const targetUserId = editingCompany.user?._id || editingCompany.user || editingCompany._id;
      await updateCompanyDetailsAdmin(targetUserId, {
        ...formData,
        companyName: formData.companyName.trim(),
        phone: phoneCheck.cleaned || formData.phone.trim()
      });
      setIsModalOpen(false);
      setActionMessage('Company details updated successfully!');
      loadCompanies();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update company details.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCompanies = companies.filter(c =>
    (c.companyName || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.user?.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.location || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.industry || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    const columns = [
      { label: 'Company Name', accessor: (c) => c.companyName || c.user?.name || 'N/A' },
      { label: 'Contact Email', accessor: (c) => c.user?.email || 'N/A' },
      { label: 'Industry Sector', accessor: (c) => c.industry || 'IT' },
      { label: 'Headquarters Location', accessor: (c) => c.location || 'N/A' },
      { label: 'Contact Phone', accessor: (c) => c.phone || 'N/A' },
      { label: 'Official Website', accessor: (c) => c.website || 'N/A' },
      { label: 'Description', accessor: (c) => c.description || '' },
      { label: 'Account Status', accessor: (c) => (c.status === 'Deactive' || c.user?.status === 'Deactive' ? 'Deactive' : c.status || 'Approved') },
      { label: 'Registered Date', accessor: (c) => (c.user?.createdAt ? new Date(c.user.createdAt).toLocaleDateString() : '') }
    ];
    exportToCSV(filteredCompanies, `companies_export_${new Date().toISOString().split('T')[0]}.csv`, columns);
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
            <h2 className="fw-bold text-dark mb-0">Manage Recruiter Companies</h2>
            <small className="text-muted">Review credentials, contact details, active/deactive status & placement partnerships</small>
          </div>

          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="btn btn-outline-success btn-sm fw-bold shadow-sm"
              title="Export filtered companies to CSV"
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
            <button onClick={loadCompanies} className="btn btn-outline-secondary btn-sm fw-bold">
              <i className="bi bi-arrow-clockwise me-1"></i> Refresh
            </button>
          </div>
        </div>
      </div>

      {actionMessage && <div className="alert alert-success py-2 small shadow-sm">{actionMessage}</div>}

      {/* Main Companies Table Card */}
      <div className="card border-0 shadow-sm rounded-3 p-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h5 className="fw-bold text-dark mb-0">Registered Companies Directory</h5>
            <small className="text-muted">{filteredCompanies.length} partner recruiters found</small>
          </div>

          <div className="w-100 w-md-auto" style={{ maxWidth: '320px' }}>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search company, industry, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5 text-muted">Loading registered companies...</div>
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-5 text-muted">No company records matching your search.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 small">
              <thead className="table-light uppercase">
                <tr>
                  <th>Company Name</th>
                  <th>Industry & Location</th>
                  <th>Contact Info</th>
                  <th>Website</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((company) => {
                  const companyStatus = company.status || 'Pending';
                  const isDeactive = companyStatus === 'Deactive' || company.user?.status === 'Deactive';
                  return (
                    <tr key={company._id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '8px',
                              background: '#e9ecef',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              color: '#495057'
                            }}
                          >
                            <i className="bi bi-building"></i>
                          </div>
                          <div>
                            <span className="fw-bold text-dark d-block">
                              {company.companyName || company.user?.name || 'Recruiter Company'}
                            </span>
                            <small className="text-muted">{company.user?.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border mb-1">{company.industry || 'IT'}</span>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>📍 {company.location || 'Not Specified'}</div>
                      </td>
                      <td>
                        {company.phone ? (
                          <span className="text-dark fw-medium">📞 {company.phone}</span>
                        ) : (
                          <span className="text-muted">N/A</span>
                        )}
                      </td>
                      <td>
                        {company.website ? (
                          <a
                            href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-secondary btn-sm py-0"
                          >
                            <i className="bi bi-globe me-1"></i> Visit
                          </a>
                        ) : (
                          <span className="text-muted">None</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${!isDeactive && companyStatus === 'Approved' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning border border-warning'} fw-bold mb-1 d-inline-block`}>
                          {!isDeactive && companyStatus === 'Approved' ? 'Approved & Active' : isDeactive ? 'Deactive (Pending)' : companyStatus}
                        </span>
                        {!isDeactive && companyStatus === 'Approved' ? (
                          <button
                            onClick={() => handleToggleStatus(company.user?._id || company.user || company._id, 'Active', company.companyName || company.user?.name || 'Company')}
                            className="btn btn-link btn-sm p-0 d-block text-danger text-decoration-none"
                            style={{ fontSize: '0.75rem' }}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(company.user?._id || company.user || company._id, 'Deactive', company.companyName || company.user?.name || 'Company')}
                            className="btn btn-success btn-sm py-0 px-2 d-block fw-bold shadow-sm"
                            style={{ fontSize: '0.75rem' }}
                          >
                            <i className="bi bi-check-circle me-1"></i> Activate
                          </button>
                        )}
                      </td>
                      <td className="text-end">
                        <button
                          onClick={() => handleEditClick(company)}
                          className="btn btn-outline-primary btn-sm me-2"
                          title="Edit Company Details"
                        >
                          <i className="bi bi-pencil"></i> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(company.user?._id || company.user || company._id, company.companyName || company.user?.name || 'Company')}
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

      {/* Edit Company Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Admin Edit: Company Details"
      >
        <form onSubmit={handleFormSubmit}>
          {formError && <div className="alert alert-danger py-2 small">{formError}</div>}

          <div className="mb-3">
            <label className="form-label fw-bold small text-secondary">Company Name *</label>
            <input
              type="text"
              className="form-control"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              required
            />
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-bold small text-secondary">Industry Sector *</label>
              <input
                type="text"
                className="form-control"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold small text-secondary">Headquarters Location *</label>
              <input
                type="text"
                className="form-control"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold small text-secondary">Contact Phone *</label>
              <input
                type="tel"
                className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold small text-secondary">Account Status *</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Approved">Approved / Active</option>
              <option value="Pending">Pending Approval</option>
              <option value="Rejected">Rejected</option>
              <option value="Deactive">Deactive</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold small text-secondary">Company Description *</label>
            <textarea
              className="form-control"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
        onRefresh={loadCompanies}
      />
    </div>
  );
};

export default ManageCompanies;
