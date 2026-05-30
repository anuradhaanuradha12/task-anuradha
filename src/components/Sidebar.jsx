import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Kanban,
  ListTodo,
  Settings,
  LogOut,
  FolderDot
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { logout, user } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Kanban Board', path: '/kanban', icon: <Kanban className="h-5 w-5" /> },
    { name: 'Task List', path: '/tasks', icon: <ListTodo className="h-5 w-5" /> },
    { name: 'Profile Settings', path: '/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-20 bg-slate-950/20 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar shell */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r bg-card transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:h-screen`}
      >
        {/* Brand logo */}
        <div className="flex h-16 items-center gap-2 border-b px-6 select-none">
          <FolderDot className="h-6 w-6 text-primary animate-pulse" />
          <span className="text-lg font-bold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
            TaskFlow Pro
          </span>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-1.5 px-4 py-6">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => toggleSidebar(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer profile & logout */}
        <div className="border-t p-4 flex flex-col gap-3">
          {user && (
            <div className="flex items-center gap-3 px-2 py-1 select-none">
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-foreground truncate">
                  {user.name}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {user.role}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
