import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FileText, 
  ClipboardList,
  GraduationCap,
  UserSquare2, 
  BarChart3
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'participants', label: 'Participants', icon: Users },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'materials', label: 'Materials', icon: FileText },
    { id: 'assignments', label: 'Assignments', icon: ClipboardList },
    { id: 'exams', label: 'Exams', icon: GraduationCap },
    { id: 'trainers', label: 'Trainers', icon: UserSquare2 },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-full">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-2xl font-bold text-indigo-400">Indo Bismar</h2>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">LMS Admin Branch</p>
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium",
                    isActive 
                      ? "bg-indigo-600 text-white" 
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <Icon size={18} className={cn(isActive ? "text-white" : "text-slate-400")} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded-lg p-4">
          <p className="text-xs text-slate-400 mb-1">Current Branch</p>
          <p className="text-sm font-semibold text-white">Surabaya Central</p>
        </div>
      </div>
    </div>
  );
}
