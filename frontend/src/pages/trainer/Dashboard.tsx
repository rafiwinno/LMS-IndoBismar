import { getUser } from '../types';

export default function TrainerDashboard() {
  const user = getUser();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard Trainer</h1>
      <p className="mt-2 text-slate-600">Selamat datang, {user?.name}!</p>
      <p className="mt-1 text-sm text-slate-400">Role: {user?.role}</p>
    </div>
  );
}
