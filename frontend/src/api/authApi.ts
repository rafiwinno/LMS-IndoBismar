import API from "./api";

export const authApi = {
  login: (email: string, password: string) =>
    API.post("/auth/login", { email, password }).then((r) => r.data),

  loginAdmin: (username: string, password: string) =>
    API.post("/auth/login-admin", { username, password }).then((r) => r.data),

  register: (data: {
    nama: string;
    username: string;
    email: string;
    password: string;
    password_confirmation: string;
    nomor_hp?: string;
    asal_sekolah?: string;
    jurusan?: string;
    id_cabang: number;
  }) => API.post("/auth/register", data).then((r) => r.data),

  logout: () =>
    API.post("/auth/logout").then((r) => r.data),

  me: () =>
    API.get("/auth/me").then((r) => r.data),
};

export default authApi;
