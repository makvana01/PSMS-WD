import api from './api';

export const getStudentProfile = async () => {
  const response = await api.get('/students/profile');
  return response.data;
};

export const updateStudentProfile = async (profileData) => {
  const response = await api.put('/students/profile', profileData);
  return response.data;
};

export const uploadResume = async (formData) => {
  const response = await api.post('/students/upload-resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getAllStudentsAdmin = async () => {
  const response = await api.get('/admin/students');
  return response.data;
};

export const deleteStudentAdmin = async (id) => {
  const response = await api.delete(`/admin/students/${id}`);
  return response.data;
};

export const updateStudentDetailsAdmin = async (id, studentData) => {
  const response = await api.put(`/admin/students/${id}`, studentData);
  return response.data;
};

export const uploadAvatar = async (formData) => {
  const response = await api.post('/students/upload-avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const uploadIdCard = async (formData) => {
  const response = await api.post('/students/upload-id-card', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const toggleStudentStatusAdmin = async (id, status) => {
  const response = await api.put(`/admin/status/student/${id}`, { status });
  return response.data;
};



