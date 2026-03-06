import api from '../lib/axios';
import { DashboardData, LoginResponse } from '../pages/types';

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/login', { email, password });
    return res.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/logout');
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
  },
};

export const dashboardService = {
  getData: async (): Promise<DashboardData> => {
    const res = await api.get<DashboardData>('/dashboard');
    return res.data;
  },
};