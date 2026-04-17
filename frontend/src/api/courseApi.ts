import api from './axiosInstance';

export const getCourses = () =>
  api.get('/trainer/courses');

export const getCourse = (id: number) =>
  api.get(`/trainer/courses/${id}`);

export const createCourse = (data: FormData) =>
  api.post('/trainer/courses', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateCourse = (id: number, data: FormData) => {
  // Laravel tidak mendukung multipart PUT, gunakan POST dengan _method spoofing
  data.append('_method', 'PUT');
  return api.post(`/trainer/courses/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteCourse = (id: number) =>
  api.delete(`/trainer/courses/${id}`);

export const publishCourse = (id: number) =>
  api.post(`/trainer/courses/${id}/publish`);

export const getAllPesertaCabang = () =>
  api.get('/trainer/peserta/semua');

export const getCoursePeserta = (id: number) =>
  api.get(`/trainer/courses/${id}/peserta`);

export const enrollPesertaToCourse = (courseId: number, id_pengguna: number) =>
  api.post(`/trainer/courses/${courseId}/enroll`, { id_pengguna });

export const unenrollPesertaFromCourse = (courseId: number, id_pengguna: number) =>
  api.delete(`/trainer/courses/${courseId}/peserta/${id_pengguna}`);