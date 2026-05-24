import axios from "axios";
import type { AuthUser as User } from "../pages/types";

interface AuthResponse {
  token: string;
  user: User;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Queue untuk request yang menunggu refresh selesai
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config as typeof err.config & { _retry?: boolean };
    const isLoginEndpoint   = originalRequest?.url?.includes('/login');
    const isRefreshEndpoint = originalRequest?.url?.includes('/auth/refresh');
    const isOnLoginPage     = window.location.pathname === '/login';

    if (err.response?.status === 401 && !isLoginEndpoint && !isRefreshEndpoint && !isOnLoginPage && !originalRequest?._retry) {
      if (isRefreshing) {
        // Antri request ini sampai refresh selesai
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await api.post('/auth/refresh');
        const newToken: string = res.data.token;
        sessionStorage.setItem('token', newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default api;

export const authService = {
  loginStaff: async (username: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/login/staff", { username, password });
    return res.data;
  },

  loginPeserta: async (emailOrUsername: string, password: string): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/login/peserta", {
      email: emailOrUsername,
      password,
    });
    return res.data;
  },

  logout: async () => {
    await api.post("/logout");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  },
};

export const dashboardService = {
  getData: async () => {
    const res = await api.get("/superadmin/dashboard");
    return res.data;
  },
};