import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import Header from './Header';
import { ToastProvider } from '../../lib/toast';
import { getUser, logout as clearSession } from '../../pages/types';
import { api } from '../../lib/api';
// Admin pages
import { Dashboard } from '../../pages/admin/Dashboard';
import { Participants } from '../../pages/admin/Participants';
import { Courses } from '../../pages/admin/Courses';
import { Materials } from '../../pages/admin/Materials';
import { Exams } from '../../pages/admin/Exams';
import { Trainers } from '../../pages/admin/Trainers';
import { Reports } from '../../pages/admin/Reports';

function renderContent(activeTab: string) {
  switch (activeTab) {
    case 'dashboard':      return <Dashboard />;
    case 'participants':   return <Participants />;
    case 'courses':        return <Courses />;
    case 'materials':      return <Materials />;
    case 'exams':          return <Exams />;
    case 'trainers':       return <Trainers />;
    case 'reports':        return <Reports />;
default:               return <Dashboard />;
  }
}

export default function Layout() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = getUser();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try { await api.logout(); } catch { /* ignore */ }
    clearSession();
    navigate('/login', { replace: true });
  };

  return (
    <ToastProvider>
    <div className="flex h-screen bg-gray-50 dark:bg-[#0a0c10] font-sans text-gray-900 dark:text-white transition-colors duration-200">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        user={user}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} user={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent(activeTab)}
          </div>
        </main>
      </div>
    </div>
    </ToastProvider>
  );
}
