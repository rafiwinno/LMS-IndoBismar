import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/admin/Sidebar';
import Header from './components/admin/Header';
import { Dashboard } from './pages/admin/Dashboard';
import { Participants } from './pages/admin/Participants';
import { Courses } from './pages/admin/Courses';
import { Materials } from './pages/admin/Materials';
import { Exams } from './pages/admin/Exams';
import { Trainers } from './pages/admin/Trainers';
import { Reports } from './pages/admin/Reports';
import Login from './pages/admin/Login';
import { Toaster } from './components/admin/Toaster';
import { ConfirmDialog } from './components/admin/ConfirmDialog';
import { ToastProvider } from './lib/toast';
import { api } from './lib/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setChecking(false);
      return;
    }
    // Verifikasi token ke server agar session yang expired/invalid tidak lolos
    api.me()
      .then((userData: any) => {
        sessionStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      })
      .catch(() => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      })
      .finally(() => setChecking(false));
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try { await api.logout(); } catch {}
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
  };

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':    return <Dashboard />;
      case 'participants': return <Participants />;
      case 'courses':      return <Courses />;
      case 'materials':    return <Materials />;
      case 'exams':        return <Exams />;
      case 'trainers':     return <Trainers />;
      case 'reports':      return <Reports />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-slate-500">
            <h2 className="text-2xl font-semibold">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module
            </h2>
          </div>
        );
    }
  };

  return (
    <ToastProvider>
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <Toaster />
      <ConfirmDialog />
      <div id="no-print">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          onLogout={handleLogout}
          user={user}
        />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div id="no-print">
          <Header onMenuClick={() => setSidebarOpen(true)} user={user} />
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
    </ToastProvider>
  );
}
