// ─── Branch ───────────────────────────────────────────────────────────────────
export interface Branch {
  id: number;
  nama_cabang: string;
  kode: string;
  kota: string;
  alamat: string;
  telepon: string;
  admin: string;
  total_users: number;
  status: 'aktif' | 'nonaktif';
}

// ─── Branch User ──────────────────────────────────────────────────────────────
// Sesuai id_role: 1=superadmin | 2=admin | 3=trainer | 4=user
export type BranchUserRole = 'superadmin' | 'admin' | 'trainer' | 'user';

export interface BranchUser {
  id: number;
  nama: string;
  username: string;
  email: string | null;
  nomor_hp: string | null;
  role: BranchUserRole;
  id_role: number;
  status: string;
  is_online: boolean;
  last_login: string | null;
}

// Response dari GET /superadmin/cabang/:id/users
export interface BranchUsersResponse {
  cabang: string;
  total: number;
  data: BranchUser[];
}