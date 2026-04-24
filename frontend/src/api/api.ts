import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginPage = window.location.pathname === '/login';
    const isAuthEndpoint = error.config?.url?.includes('/login') || error.config?.url?.includes('/me');

    if (error.response?.status === 401 && !isLoginPage && !isAuthEndpoint) {
      sessionStorage.removeItem('lms_user');
      window.location.href = '/login?expired=1';
    }
    return Promise.reject(error);
  }
);

export default API;