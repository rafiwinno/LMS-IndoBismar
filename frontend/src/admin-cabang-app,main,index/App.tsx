import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import Header from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Participants } from './components/Participants';
import { Courses } from './components/Courses';
import { Materials } from './components/Materials';
import { Exams } from './components/Exams';
import { Trainers } from './components/Trainers';
import { Reports } from './components/Reports';
import Login from './components/Login';
import { api } from './lib/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
    setChecking(false);
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try { await api.logout(); } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
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
  );
}
