export type UserRole = 'user' | 'trainer' | 'admin' | 'superadmin';
export type Role = UserRole;

export interface AuthUser {
  id_pengguna: number;
  nama: string;
  username: string;
  email: string;
  nomor_hp?: string;
  id_role: number;
  id_cabang?: number;
  role: UserRole;
}

// Map id_role dari backend ke string role
function mapRole(id_role: number): UserRole {
  switch (id_role) {
    case 1: return 'superadmin';
    case 2: return 'admin';
    case 3: return 'trainer';
    case 4: return 'user';
    default: return 'user';
  }
}

// Ambil user dari localStorage
export function getUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      ...parsed,
      role: mapRole(parsed.id_role),
    };
  } catch {
    return null;
  }
}

// Ambil token dari localStorage
export function getToken(): string | null {
  return localStorage.getItem('token');
}

// Simpan token & user ke localStorage
export function saveToken(token: string): void {
  localStorage.setItem('token', token);
}

export function saveUser(user: object): void {
  localStorage.setItem('user', JSON.stringify(user));
}

// Logout: bersihkan storage
export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// Tentukan path dashboard berdasarkan role
export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'trainer':    return '/trainer/dashboard';
    case 'admin':      return '/admin/dashboard';
    case 'superadmin': return '/superadmin/dashboard';
    default:           return '/dashboard';
  }
}