import api from './api';

export const getCompanyProfile = async () => {
  const response = await api.get('/companies/profile');
  return response.data;
};

export const updateCompanyProfile = async (profileData) => {
  const response = await api.put('/companies/profile', profileData);
  return response.data;
};

export const getCompanyStats = async () => {
  const response = await api.get('/companies/stats');
  return response.data;
};

export const getAllCompaniesAdmin = async () => {
  const response = await api.get('/admin/companies');
  return response.data;
};

export const deleteCompanyAdmin = async (id) => {
  const response = await api.delete(`/admin/companies/${id}`);
  return response.data;
};

export const updateCompanyStatusAdmin = async (id, status) => {
  const response = await api.put(`/admin/companies/${id}/status`, { status });
  return response.data;
};

export const updateCompanyDetailsAdmin = async (id, companyData) => {
  const response = await api.put(`/admin/companies/${id}`, companyData);
  return response.data;
};

export const toggleCompanyStatusAdmin = async (id, status) => {
  const response = await api.put(`/admin/status/company/${id}`, { status });
  return response.data;
};


