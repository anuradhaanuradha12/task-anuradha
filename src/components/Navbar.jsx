import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { useTasks } from '../context/TaskContext';
import { Menu, Sun, Moon, Bell, Search, LogOut, Settings, User } from 'lucide-react';
import UserAvatar from './UserAvatar';
import NotificationPanel from './NotificationPanel';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { notifications } = useSocket();
  const { searchQuery, setSearchQuery } = useTasks();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <header className="flex h-16 w-full items-center justify-between border-b bg-card/85 px-6 shadow-sm sticky top-0 z-20 backdrop-blur-md">
      
      {/* Left: Toggler & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative max-w-md w-full hidden md:block">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground/75" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, descriptions..."
            className="h-10 w-full rounded-xl border border-input/60 bg-background/50 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Right: Actions (Theme, Notif, Profile) */}
      <div className="flex items-center gap-4">
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
          title="Toggle color theme"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all relative"
            title="Notifications list"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-card animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 z-50">
              <NotificationPanel onClose={() => setShowNotifications(false)} />
            </div>
          )}
        </div>

        {/* Profile Dropdown Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-secondary transition-all"
          >
            <UserAvatar user={user} size="sm" showStatus={false} />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border shadow-xl bg-card p-1 z-50 animate-slide-in">
              <div className="px-3.5 py-2.5 border-b border-border/40 select-none">
                <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
              
              <div className="py-1">
                <a
                  href="/settings"
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Profile settings
                </a>
                
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
