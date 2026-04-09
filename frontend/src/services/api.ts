import axios from "axios";
import type { AuthUser as User } from "../pages/types";

interface AuthResponse {
  token: string;
  user: User;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLoginEndpoint = err.config?.url?.includes('/login');
    const isOnLoginPage   = window.location.pathname === '/login';

    if (err.response?.status === 401 && !isLoginEndpoint && !isOnLoginPage) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      window.location.href = "/login";
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