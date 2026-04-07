import { useEffect, useState } from 'react';
import { FileText, UploadCloud, CheckCircle, AlertCircle, Loader2, ShieldCheck, Clock } from 'lucide-react';
import API from '../../api/api';
import { DocumentsSkeleton } from '../../components/ui/Skeleton';

interface Dokumen {
  surat_siswa: string | null;
  surat_orang_tua: string | null;
  status: string | null;
  tanggal_verifikasi: string | null;
}

const DOKUMEN_LIST = [
  { jenis: 'surat_siswa', label: 'Surat Pernyataan Magang', deskripsi: 'Upload surat pernyataan magang yang telah ditandatangani.' },
  { jenis: 'surat_orang_tua', label: 'Surat Pernyataan Orang Tua', deskripsi: 'Upload surat pernyataan orang tua yang telah ditandatangani.' },
];

const statusBadge: Record<string, { label: string; className: string; icon: JSX.Element }> = {
  pending: {
    label: 'Menunggu Verifikasi',
    className: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
    icon: <Clock size={14} />,
  },
  terverifikasi: {
    label: 'Terverifikasi',
    className: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    icon: <ShieldCheck size={14} />,
  },
  ditolak: {
    label: 'Ditolak',
    className: 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400',
    icon: <AlertCircle size={14} />,
  },
};

export default function Documents() {
  const [dokumen, setDokumen] = useState<Dokumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchDokumen = async () => {
    try {
      const res = await API.get('/user/dokumen');
      setDokumen(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDokumen(); }, []);

  const handleFileChange = async (jenis: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSuccessMsg(''); setErrorMsg(''); setUploading(jenis);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await API.post(`/user/dokumen/${jenis}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      await fetchDokumen();
      setSuccessMsg('Dokumen berhasil diupload!');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal mengupload dokumen.');
    } finally { setUploading(null); e.target.value = ''; }
  };

  const isUploaded = (jenis: string) => !!dokumen?.[jenis as keyof Dokumen];
  const badge = dokumen?.status ? statusBadge[dokumen.status] ?? statusBadge['pending'] : null;

  if (loading) return <DocumentsSkeleton />;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dokumen Saya</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Upload dokumen persyaratan PKL Anda</p>
      </div>

      {badge && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${badge.className}`}>
          {badge.icon}
          <span>Status Dokumen: <strong>{badge.label}</strong></span>
          {dokumen?.tanggal_verifikasi && (
            <span className="ml-auto text-xs opacity-70">
              {new Date(dokumen.tanggal_verifikasi).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          )}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-medium">
          ✅ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 rounded-xl text-sm font-medium">
          ❌ {errorMsg}
        </div>
      )}

      <div className="space-y-4">
        {DOKUMEN_LIST.map(({ jenis, label, deskripsi }) => {
          const uploaded = isUploaded(jenis);
          const isUploading = uploading === jenis;

          return (
            <div key={jenis} className="bg-white dark:bg-[#161b27] rounded-2xl shadow-sm border border-gray-200 dark:border-white/8 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${uploaded ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500'}`}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{label}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{deskripsi}</p>
                    {uploaded ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-medium mt-2">
                        <CheckCircle size={15} /><span>Sudah diupload</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-rose-500 dark:text-rose-400 text-sm font-medium mt-2">
                        <AlertCircle size={15} /><span>Belum diupload</span>
                      </div>
                    )}
                  </div>
                </div>

                <label className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer select-none ${
                  isUploading
                    ? 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed pointer-events-none'
                    : uploaded
                      ? 'bg-gray-100 dark:bg-white/8 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                      : 'bg-red-600 text-white hover:bg-red-700'
                }`}>
                  {isUploading ? (
                    <><Loader2 size={16} className="animate-spin" />Mengupload...</>
                  ) : (
                    <><UploadCloud size={16} />{uploaded ? 'Ganti File' : 'Upload'}</>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    disabled={isUploading}
                    onChange={e => handleFileChange(jenis, e)}
                  />
                </label>
              </div>

              <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 pt-4 border-t border-gray-100 dark:border-white/8">
                Format yang diterima: PDF, JPG, PNG — Maksimal 2MB
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}