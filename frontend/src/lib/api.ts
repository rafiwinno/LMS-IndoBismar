const API_BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = sessionStorage.getItem('token');
  const isFormData = options.body instanceof FormData;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
  }

  const isLoginEndpoint = endpoint === '/auth/login' || endpoint === '/auth/login-admin';
  if (res.status === 401 && !isLoginEndpoint) {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = '/';
    throw new Error('Sesi telah berakhir. Silakan login kembali.');
  }

  let data: any;
  try {
    data = await res.json();
  } catch {
    throw new Error('Respons server tidak valid.');
  }

  if (!res.ok) {
    if (res.status === 429) {
      const retryAfter = parseInt(res.headers.get('Retry-After') ?? '60', 10);
      const err = new Error('Terlalu banyak percobaan. Coba lagi dalam beberapa saat.');
      (err as any).retryAfter = retryAfter;
      throw err;
    }
    // Tangani validation errors (422)
    if (res.status === 422 && data.errors) {
      const messages = Object.values(data.errors as Record<string, string[]>)
        .flat()
        .join(', ');
      throw new Error(messages || data.message || 'Validasi gagal');
    }
    throw new Error(data.message || 'Request gagal');
  }

  return data;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  loginAdmin: (username: string, password: string) =>
    apiFetch('/auth/login-admin', { method: 'POST', body: JSON.stringify({ username, password }) }),
  register: (data: any) =>
    apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  logout: () =>
    apiFetch('/auth/logout', { method: 'POST' }),
  me: () => apiFetch('/auth/me'),

  // Dashboard
  dashboard: () => apiFetch('/dashboard'),

  // Peserta
  getPeserta: (params?: string) => apiFetch(`/peserta${params ? '?' + params : ''}`),
  createPeserta: (data: any) => apiFetch('/peserta', { method: 'POST', body: JSON.stringify(data) }),
  updatePeserta: (id: number, data: any) => apiFetch(`/peserta/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePeserta: (id: number) => apiFetch(`/peserta/${id}`, { method: 'DELETE' }),
  updateStatusPeserta: (id: number, status: string) =>
    apiFetch(`/peserta/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getPesertaDetail: (id: number) => apiFetch(`/peserta/${id}`),

  // Kursus
  getKursus: (params?: string) => apiFetch(`/kursus${params ? '?' + params : ''}`),
  createKursus: (data: any) => apiFetch('/kursus', { method: 'POST', body: JSON.stringify(data) }),
  updateKursus: (id: number, data: any) => apiFetch(`/kursus/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteKursus: (id: number) => apiFetch(`/kursus/${id}`, { method: 'DELETE' }),
  updateStatusKursus: (id: number, status: string) =>
    apiFetch(`/kursus/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Enrollment (admin cabang)
  getKursusPeserta: (kursusId: number) => apiFetch(`/kursus/${kursusId}/peserta`),
  enrollPeserta: (kursusId: number, id_pengguna: number) =>
    apiFetch(`/kursus/${kursusId}/enroll`, { method: 'POST', body: JSON.stringify({ id_pengguna }) }),
  unenrollPeserta: (kursusId: number, id_pengguna: number) =>
    apiFetch(`/kursus/${kursusId}/peserta/${id_pengguna}`, { method: 'DELETE' }),

  // Materi
  getMateri: (params?: string) => apiFetch(`/materi${params ? '?' + params : ''}`),
  createMateri: (data: FormData) => apiFetch('/materi', { method: 'POST', body: data }),
  deleteMateri: (id: number) => apiFetch(`/materi/${id}`, { method: 'DELETE' }),

  // Tugas
  getTugas: (params?: string) => apiFetch(`/tugas${params ? '?' + params : ''}`),
  createTugas: (data: any) => apiFetch('/tugas', { method: 'POST', body: JSON.stringify(data) }),
  updateTugas: (id: number, data: any) => apiFetch(`/tugas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTugas: (id: number) => apiFetch(`/tugas/${id}`, { method: 'DELETE' }),
  getSubmissions: (id: number) => apiFetch(`/tugas/${id}/submissions`),
  gradeTugas: (subId: number, data: any) =>
    apiFetch(`/tugas/submissions/${subId}/grade`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Kuis
  getKuis: (params?: string) => apiFetch(`/kuis${params ? '?' + params : ''}`),
  getKuisDetail: (id: number) => apiFetch(`/kuis/${id}`),
  createKuis: (data: any) => apiFetch('/kuis', { method: 'POST', body: JSON.stringify(data) }),
  updateKuis: (id: number, data: any) => apiFetch(`/kuis/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteKuis: (id: number) => apiFetch(`/kuis/${id}`, { method: 'DELETE' }),
  getKuisResults: (id: number) => apiFetch(`/kuis/${id}/results`),
  gradeEssay: (attemptId: number, scores: Record<number, number>) =>
    apiFetch(`/kuis/attempts/${attemptId}/grade-essay`, { method: 'PATCH', body: JSON.stringify({ scores }) }),

  // Trainer
  getTrainer: (params?: string) => apiFetch(`/trainer${params ? '?' + params : ''}`),
  getTrainerDetail: (id: number) => apiFetch(`/trainer/${id}`),
  createTrainer: (data: any) => apiFetch('/trainer', { method: 'POST', body: JSON.stringify(data) }),
  updateTrainer: (id: number, data: any) => apiFetch(`/trainer/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTrainer: (id: number) => apiFetch(`/trainer/${id}`, { method: 'DELETE' }),
  updateStatusTrainer: (id: number, status: string) =>
    apiFetch(`/trainer/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getAllJadwal: (params?: string) => apiFetch(`/trainer/jadwal/all${params ? '?' + params : ''}`),
  createJadwal: (data: any) => apiFetch('/trainer/jadwal', { method: 'POST', body: JSON.stringify(data) }),
  updateJadwal: (id: number, data: any) => apiFetch(`/trainer/jadwal/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteJadwal: (id: number) => apiFetch(`/trainer/jadwal/${id}`, { method: 'DELETE' }),

  // Laporan
  getLaporan: () => apiFetch('/laporan/dashboard'),
  getLaporanPeserta: () => apiFetch('/laporan/peserta'),
  getLaporanKursus: () => apiFetch('/laporan/kursus'),
  getLaporanKuis: () => apiFetch('/laporan/kuis'),
  getLaporanTrainer: () => apiFetch('/laporan/trainer'),

  // Verifikasi Dokumen (admin)
  verifikasiDokumen: (id: number, aksi: 'setujui' | 'tolak', catatan?: string) =>
    apiFetch(`/peserta/${id}/verifikasi-dokumen`, {
      method: 'PATCH',
      body: JSON.stringify({ aksi, catatan }),
    }),

  // Upload dokumen oleh peserta (setelah login)
  uploadDokumen: (formData: FormData) =>
    apiFetch('/peserta/saya/dokumen', { method: 'POST', body: formData }),

  // Notifikasi
  getNotifikasi: () => apiFetch('/notifikasi'),
  bacaNotifikasi: (id: number) => apiFetch(`/notifikasi/${id}/baca`, { method: 'PATCH' }),
  bacaSemuaNotifikasi: () => apiFetch('/notifikasi/baca-semua', { method: 'PATCH' }),
};
