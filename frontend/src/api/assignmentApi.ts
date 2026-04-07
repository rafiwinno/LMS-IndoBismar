import api from './axiosInstance';

export const getAssignments = (courseId: number) =>
  api.get(`/trainer/courses/${courseId}/assignments`);

export const createAssignment = (data: {
  id_kursus: number;
  judul_tugas: string;
  deskripsi: string;
  deadline: string;
  nilai_maksimal: number;
}) => api.post('/trainer/assignments', data);

export const updateAssignment = (
  id: number,
  data: { judul_tugas?: string; deskripsi?: string; deadline?: string; nilai_maksimal?: number }
) => api.put(`/trainer/assignments/${id}`, data);

export const deleteAssignment = (id: number) =>
  api.delete(`/trainer/assignments/${id}`);