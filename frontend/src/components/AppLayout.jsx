import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  UserCircle,
  LogOut,
} from 'lucide-react';

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { label: 'Projects', icon: FolderKanban, path: '/projects' },
    { label: 'Tasks', icon: ListTodo, path: '/tasks' },
    { label: 'Profile', icon: UserCircle, path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar — always visible, fixed on the left */}
      <aside className="w-64 bg-primary text-white p-6 flex flex-col justify-between min-h-screen fixed left-0 top-0 z-30">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent rounded-lg">
              <LayoutDashboard className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Team Task Manager</h1>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  className={`w-full justify-start text-white hover:bg-white/10 ${
                    isActive ? 'bg-white/15 font-semibold' : ''
                  }`}
                  onClick={() => setLocation(item.path)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6">
          <div className="mb-4 px-2">
            <p className="text-sm text-white/60">Signed in as</p>
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-accent">{user?.role}</p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-white hover:bg-red-500/20"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content — offset by sidebar width */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto ml-64">
        {children}
      </main>
    </div>
  );
}
