import React from 'react';
import { useSocket } from '../context/SocketContext';

// Helper to generate a background color gradient based on string hash
const getGradient = (name = 'User') => {
  const colors = [
    'from-indigo-500 to-purple-600',
    'from-blue-500 to-indigo-600',
    'from-emerald-400 to-teal-600',
    'from-rose-400 to-pink-600',
    'from-amber-400 to-orange-500',
    'from-violet-500 to-fuchsia-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const UserAvatar = ({ user, size = 'md', showStatus = true }) => {
  const { onlineUsers } = useSocket();
  
  if (!user) return null;

  const userId = user.id || user._id || user;
  const userName = user.name || 'User';
  const userAvatar = user.avatar || userName.slice(0, 2).toUpperCase();

  // Check if user is online
  const isOnline = onlineUsers.some((u) => String(u.id || u._id) === String(userId));

  const sizeClasses = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm font-semibold',
    lg: 'h-12 w-12 text-base font-bold',
    xl: 'h-16 w-16 text-lg font-bold',
  };

  const statusDotSizes = {
    xs: 'h-1.5 w-1.5 ring-[1px]',
    sm: 'h-2 w-2 ring-2',
    md: 'h-2.5 w-2.5 ring-2',
    lg: 'h-3 w-3 ring-2',
    xl: 'h-4 w-4 ring-2',
  };

  return (
    <div className="relative inline-flex items-center justify-center select-none flex-shrink-0">
      {/* Avatar Container */}
      <div
        className={`flex items-center justify-center rounded-full text-white shadow-sm bg-gradient-to-br uppercase tracking-wider ${
          getGradient(userName)
        } ${sizeClasses[size]}`}
      >
        {userAvatar.slice(0, 2)}
      </div>

      {/* Online/Offline Status Indicator */}
      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-card ${
            isOnline ? 'bg-emerald-500' : 'bg-slate-400'
          } ${statusDotSizes[size]}`}
          title={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
};

export default UserAvatar;
