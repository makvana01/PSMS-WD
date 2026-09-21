import api from './api';

export const getJobs = async (search = '', location = '', status = '') => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (location) params.append('location', location);
  if (status) params.append('status', status);

  const response = await api.get(`/jobs?${params.toString()}`);
  return response.data;
};

export const getJobById = async (id) => {
  const response = await api.get(`/jobs/${id}`);
  return response.data;
};

export const createJob = async (jobData) => {
  const response = await api.post('/jobs', jobData);
  return response.data;
};

export const updateJob = async (id, jobData) => {
  const response = await api.put(`/jobs/${id}`, jobData);
  return response.data;
};

export const deleteJob = async (id) => {
  const response = await api.delete(`/jobs/${id}`);
  return response.data;
};

export const getMyCompanyJobs = async () => {
  const response = await api.get('/jobs/company/my-jobs');
  return response.data;
};

export const updateJobStatusAdmin = async (id, approvalStatus) => {
  const response = await api.put(`/admin/jobs/${id}/status`, { approvalStatus });
  return response.data;
};

