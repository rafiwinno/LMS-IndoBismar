import { useEffect, useState } from 'react';
import { FileText, UploadCloud, CheckCircle, AlertCircle, Loader2, ShieldCheck, Clock } from 'lucide-react';
import API from '../../api/api';

interface Dokumen {
  surat_siswa: string | null;
  surat_orang_tua: string | null;
  status: string | null;
  tanggal_verifikasi: string | null;
}

const DOKUMEN_LIST = [
  {
    jenis: 'surat_siswa',
    label: 'Surat Pernyataan Magang',
    deskripsi: 'Upload surat pernyataan magang yang telah ditandatangani.',
  },
  {
    jenis: 'surat_orang_tua',
    label: 'Surat Pernyataan Orang Tua',
    deskripsi: 'Upload surat pernyataan orang tua yang telah ditandatangani.',
  },
];

const statusBadge: Record<string, { label: string; className: string; icon: JSX.Element }> = {
  pending: {
    label: 'Menunggu Verifikasi',
    className: 'bg-amber-100 text-amber-700',
    icon: <Clock size={14} />,
  },
  terverifikasi: {
    label: 'Terverifikasi',
    className: 'bg-emerald-100 text-emerald-700',
    icon: <ShieldCheck size={14} />,
  },
  ditolak: {
    label: 'Ditolak',
    className: 'bg-rose-100 text-rose-700',
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDokumen();
  }, []);

  const handleFileChange = async (jenis: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSuccessMsg('');
    setErrorMsg('');
    setUploading(jenis);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await API.post(`/user/dokumen/${jenis}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchDokumen();
      setSuccessMsg('Dokumen berhasil diupload!');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal mengupload dokumen.');
    } finally {
      setUploading(null);
      e.target.value = '';
    }
  };

  const isUploaded = (jenis: string) => {
    if (!dokumen) return false;
    return !!dokumen[jenis as keyof Dokumen];
  };

  const badge = dokumen?.status ? statusBadge[dokumen.status] ?? statusBadge['pending'] : null;

  if (loading) return <div className="text-center text-slate-500 py-12">Memuat dokumen...</div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dokumen Saya</h1>
        <p className="text-slate-500 text-sm mt-1">Upload dokumen persyaratan PKL Anda</p>
      </div>

      {/* Status verifikasi */}
      {badge && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${badge.className}`}>
          {badge.icon}
          <span>Status Dokumen: <strong>{badge.label}</strong></span>
          {dokumen?.tanggal_verifikasi && (
            <span className="ml-auto text-xs opacity-70">
              {new Date(dokumen.tanggal_verifikasi).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </span>
          )}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium">
          ✅ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-medium">
          ❌ {errorMsg}
        </div>
      )}

      <div className="space-y-4">
        {DOKUMEN_LIST.map(({ jenis, label, deskripsi }) => {
          const uploaded = isUploaded(jenis);
          const isUploading = uploading === jenis;

          return (
            <div key={jenis} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-start justify-between gap-4">
                {/* Info */}
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${uploaded ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{label}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{deskripsi}</p>
                    {uploaded ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium mt-2">
                        <CheckCircle size={15} />
                        <span>Sudah diupload</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-rose-500 text-sm font-medium mt-2">
                        <AlertCircle size={15} />
                        <span>Belum diupload</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload button */}
                <label className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer
                  ${isUploading
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : uploaded
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}>
                  {isUploading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Mengupload...
                    </>
                  ) : (
                    <>
                      <UploadCloud size={16} />
                      {uploaded ? 'Ganti File' : 'Upload'}
                    </>
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

              <p className="text-xs text-slate-400 mt-4 pt-4 border-t border-slate-100">
                Format yang diterima: PDF, JPG, PNG — Maksimal 2MB
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}