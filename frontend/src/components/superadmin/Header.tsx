import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, LogOut, Menu, Bell, X } from 'lucide-react';
import { useState } from 'react';
import { authService } from '../../services/api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function SuperAdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

  const navigation = [
    { name: 'National Dashboard', href: '/superadmin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', href: '/superadmin/users', icon: Users },
    { name: 'Branch Management', href: '/superadmin/branches', icon: Building2 },
  ];

  const handleLogout = async () => {
  try {
    await authService.logout();
  } catch {
    // tetap logout meski request gagal
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
  } finally {
    navigate('/');
  }
};

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-30 bg-slate-900 text-slate-300 transition-all duration-300 ease-in-out flex flex-col",
        isSidebarOpen ? "lg:w-64" : "lg:w-20",
        "w-64 lg:static lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>

        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 bg-slate-950/50 shrink-0">
          <div className={cn("flex items-center gap-3 overflow-hidden", !isSidebarOpen && "lg:justify-center lg:w-full")}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">
              IB
            </div>
            <span className={cn(
              "text-base font-bold text-white tracking-tight whitespace-nowrap transition-all duration-300",
              !isSidebarOpen && "lg:hidden"
            )}>
              Bismar Education
            </span>
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm",
                !isSidebarOpen && "lg:justify-center",
                isActive
                  ? "bg-blue-600/10 text-blue-400"
                  : "hover:bg-slate-800/50 hover:text-white"
              )}
              title={!isSidebarOpen ? item.name : undefined}
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={20}
                    className={cn("shrink-0", isActive ? "text-blue-400" : "text-slate-400")}
                  />
                  <span className={cn(
                    "whitespace-nowrap transition-all duration-300",
                    !isSidebarOpen && "lg:hidden"
                  )}>
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800 shrink-0">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm",
              "text-slate-400 hover:bg-slate-800/50 hover:text-white w-full",
              !isSidebarOpen && "lg:justify-center"
            )}
          >
            <LogOut size={20} className="shrink-0" />
            <span className={cn("whitespace-nowrap", !isSidebarOpen && "lg:hidden")}>
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            {/* Desktop toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:flex p-2 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Mobile toggle */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-slate-800">SuperAdmin Portal</h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 relative transition-colors rounded-md hover:bg-slate-100">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            
            <div className="h-8 w-px bg-slate-200 mx-1"></div>
                <Link to="/" className="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-3 rounded-full transition-colors">
                      <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm">
                        SA
                      </div>
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-semibold text-slate-700 leading-tight">Super Admin</p>
                        <p className="text-xs text-slate-500">System Administrator</p>
                      </div>
                </Link>        
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
