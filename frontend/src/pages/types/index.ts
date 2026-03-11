export type Role = "user" | "admin" | "trainer" | "superadmin";

export interface User {
  id: number;
  nama: string;
  username: string;
  email: string | null;
  role: Role;
  id_role: number;
  id_cabang: number;
  status: string;
}

export function getDashboardPath(role: Role): string {
  switch (role) {
    case "superadmin": return "/superadmin/dashboard";
    case "admin":      return "/admin/dashboard";
    case "trainer":    return "/trainer/dashboard";
    case "user":       return "/dashboard";
    default:           return "/login";
  }
}

export function getUser(): User | null {
  try {
    const raw = localStorage.getItem("lms_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveUser(user: User): void {
  localStorage.setItem("lms_user", JSON.stringify(user));
}

export interface WeeklyChart {
  day: string;
  date: string;
  active_users: number;
}

export interface DashboardData {
  stats: {
    total_active_users: number;
    total_branches: number;
  };
  weekly_chart: WeeklyChart[];
}

export function removeUser(): void {
  localStorage.removeItem("lms_user");
  localStorage.removeItem("lms_token");
}