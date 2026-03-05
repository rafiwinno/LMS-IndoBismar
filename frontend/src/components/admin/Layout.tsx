import { useState } from 'react';
import { Sidebar } from './Sidebar';
import Header from './Header';
import { Dashboard } from './Dashboard';
import { Participants } from './Participants';
import { Courses } from './Courses';
import { Materials } from './Materials';
import { Assignments } from './Assignments';
import { Exams } from './Exams';
import { Trainers } from './Trainers';
import { Reports } from './Reports';

function renderContent(activeTab: string) {
  switch (activeTab) {
    case 'dashboard': return <Dashboard />;
    case 'participants': return <Participants />;
    case 'courses': return <Courses />;
    case 'materials': return <Materials />;
    case 'assignments': return <Assignments />;
    case 'exams': return <Exams />;
    case 'trainers': return <Trainers />;
    case 'reports': return <Reports />;
    default: return <Dashboard />;
  }
}

export default function Layout() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent(activeTab)}
          </div>
        </main>
      </div>
    </div>
  );
}
