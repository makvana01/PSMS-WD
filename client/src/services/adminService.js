import api from './api';

export const getTrashRecordsAdmin = async () => {
  const response = await api.get('/admin/trash');
  return response.data;
};

export const restoreRecordAdmin = async (type, id) => {
  const response = await api.put(`/admin/restore/${type}/${id}`);
  return response.data;
};

export const hardDeleteRecordAdmin = async (type, id) => {
  const response = await api.delete(`/admin/hard-delete/${type}/${id}`);
  return response.data;
};

export const deleteJobAdmin = async (id) => {
  const response = await api.delete(`/admin/jobs/${id}`);
  return response.data;
};

export const updateJobAdmin = async (id, jobData) => {
  const response = await api.put(`/admin/jobs/${id}`, jobData);
  return response.data;
};
