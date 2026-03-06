export type Role = "user" | "admin" | "trainer" | "superadmin";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export const saveUser = (user: User) => {
  localStorage.setItem("lms_user", JSON.stringify(user));
};

export const getUser = (): User | null => {
  const data = localStorage.getItem("lms_user");
  return data ? JSON.parse(data) : null;
};

export const removeUser = () => {
  localStorage.removeItem("lms_user");
};

export const getDashboardPath = (role: Role): string => {
  switch (role) {
    case "superadmin": return "/superadmin/dashboard";
    case "admin":      return "/admin/dashboard";
    case "trainer":    return "/trainer/dashboard";
    case "user":
    default:           return "/dashboard";
  }
}; // ← tutup getDashboardPath di sini

export interface DashboardStats {
  total_active_users: number;
  total_branches: number;
}

export interface WeeklyChartItem {
  day: string;
  date: string;
  active_users: number;
}

export interface DashboardData {
  stats: DashboardStats;
  weekly_chart: WeeklyChartItem[];
}

export interface LoginResponse {
  token: string;
  user: User & { role: Role };
}