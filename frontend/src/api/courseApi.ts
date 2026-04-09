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
  api.patch(`/trainer/courses/${id}/publish`);