export type Role = "user" | "admin" | "trainer" | "superadmin";

export interface User {
  id: number;
  nama: string;
  email: string;
  role: Role;
}

// User 
export const saveUser = (user: User) => {
  sessionStorage.setItem("lms_user", JSON.stringify(user));
}

export const getUser = (): User | null => {
  const data = sessionStorage.getItem("lms_user");
  return data ? JSON.parse(data) : null;
}

export const removeUser = () => {
  sessionStorage.removeItem("lms_user");
}

// Token 
export const saveToken = (token: string) => {
  sessionStorage.setItem("lms_token", token);
}

export const getToken = (): string | null => {
  return sessionStorage.getItem("lms_token");
}

export const removeToken = () => {
  sessionStorage.removeItem("lms_token");
}

// Redirect 
export const getDashboardPath = (role: Role): string => {
  switch (role) {
    case "superadmin":  return "/admin/dashboard";
    case "admin":       return "/admin/dashboard";
    case "trainer":     return "/trainer/dashboard";
    case "user":      
    default:            return "/dashboard";
  }
};