import api from './api';

export const applyForJob = async (jobId) => {
  const response = await api.post(`/applications/apply/${jobId}`);
  return response.data;
};

export const getStudentApplications = async () => {
  const response = await api.get('/applications/student/my-applications');
  return response.data;
};

export const getCompanyApplicants = async () => {
  const response = await api.get('/applications/company/applicants');
  return response.data;
};

export const getAllApplicationsAdmin = async () => {
  const response = await api.get('/applications/admin/all');
  return response.data;
};

export const updateApplicationStatus = async (id, status) => {
  const response = await api.put(`/applications/${id}/status`, { status });
  return response.data;
};

export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};
