import api from './axiosInstance';

export const loginPeserta = (data: { email: string; password: string }) =>
  api.post('/login/peserta', data);

export const loginStaff = (data: { username: string; password: string }) =>
  api.post('/login/staff', data);

export const register = (data: {
  nama: string;
  username: string;
  email: string;
  password: string;
  nomor_hp: string;
}) => api.post('/register', data);