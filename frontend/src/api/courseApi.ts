import api from './axiosInstance';

export const getCourses = () =>
  api.get('/trainer/courses');

export const getCourse = (id: number) =>
  api.get(`/trainer/courses/${id}`);

export const createCourse = (data: { judul_kursus: string; deskripsi: string }) =>
  api.post('/trainer/courses', data);

export const updateCourse = (id: number, data: { judul_kursus: string; deskripsi: string }) =>
  api.put(`/trainer/courses/${id}`, data);

export const deleteCourse = (id: number) =>
  api.delete(`/trainer/courses/${id}`);

export const publishCourse = (id: number) =>
  api.patch(`/trainer/courses/${id}/publish`);