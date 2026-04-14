import api from './axiosInstance';

export const getMaterials = (courseId: number) =>
  api.get(`/trainer/courses/${courseId}/materials`);

export const createMaterial = (data: FormData) =>
  api.post('/trainer/materials', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateMaterial = (
  id: number,
  data: { judul_materi?: string; tipe_materi?: string; urutan?: number; link_video?: string }
) => api.put(`/trainer/materials/${id}`, data);

export const deleteMaterial = (id: number) =>
  api.delete(`/trainer/materials/${id}`);