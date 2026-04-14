import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import TrainerSidebar from './Sidebar';
import TrainerHeader from './Header';
import { ToastProvider } from '../../lib/toast';

export default function TrainerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
    <div className="flex h-screen bg-gray-50 dark:bg-[#0d0f14] font-sans text-gray-900 dark:text-white transition-colors duration-200">
      <TrainerSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TrainerHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0d0f14] p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
    </ToastProvider>
  );
}