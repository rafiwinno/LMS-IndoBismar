
export type Role = "user" | "admin" | "trainer" | "superadmin";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

// User 
export const saveUser = (user: User) => {
  localStorage.setItem("lms_user", JSON.stringify(user));
}

export const getUser = (): User | null => {
  const data = localStorage.getItem("lms_user");
  return data ? JSON.parse(data) : null;
}

export const removeUser = () => {
  localStorage.removeItem("lms_user");
}

// Token 
export const saveToken = (token: string) => {
  localStorage.setItem("lms_token", token);
}

export const getToken = (): string | null => {
  return localStorage.getItem("lms_token");
}

export const removeToken = () => {
  localStorage.removeItem("lms_token");
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