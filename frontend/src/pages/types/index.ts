
export type Role = "user" | "admin" | "trainer" | "superadmin";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

// simpan user ke localStorage setelah login
export const saveUser = (user: User) => {
  localStorage.setItem("lms_user", JSON.stringify(user));
};

// ambil user dari localStorage
export const getUser = (): User | null => {
  const data = localStorage.getItem("lms_user");
  return data ? JSON.parse(data) : null;
};

// hapus user dari localStorage (logout)
export const removeUser = () => {
  localStorage.removeItem("lms_user");
};

// redirect path berdasarkan role
export const getDashboardPath = (role: Role): string => {
  switch (role) {
    case "superadmin": return "/superadmin/dashboard";
    case "admin":      return "/admin/dashboard";
    case "trainer":    return "/trainer/dashboard";
    case "user":
    default:           return "/dashboard";
  }
};
