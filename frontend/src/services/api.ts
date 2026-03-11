import axios from "axios";
import { User } from "../pages/types";

// Tambah interface response login
interface AuthResponse {
  token: string;
  user: User;
}

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("lms_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("lms_token");
      localStorage.removeItem("lms_user");
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
    email: emailOrUsername,    // backend cek email OR username
    password,
  });
  return res.data;
},

  logout: async () => {
    await api.post("/logout");
    localStorage.removeItem("lms_token");
    localStorage.removeItem("lms_user");
  },
};

export const dashboardService = {
  getData: async () => {
    const res = await api.get("/superadmin/dashboard");
    return res.data;
  },
};