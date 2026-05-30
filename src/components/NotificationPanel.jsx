import React from 'react';
import { useSocket } from '../context/SocketContext';
import { BellOff, Check, Trash2, Clock } from 'lucide-react';
import UserAvatar from './UserAvatar';

const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const NotificationPanel = ({ onClose }) => {
  const { notifications, markRead, clearAll } = useSocket();

  const handleMarkRead = (e, id) => {
    e.stopPropagation();
    markRead(id);
  };

  return (
    <div className="w-80 sm:w-96 rounded-2xl border shadow-xl glass p-1 flex flex-col max-h-[480px]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/40">
        <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
          Notifications
          {notifications.filter((n) => !n.read).length > 0 && (
            <span className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-bold">
              {notifications.filter((n) => !n.read).length} New
            </span>
          )}
        </h3>
        
        {notifications.length > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium flex items-center gap-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 px-2 py-1 rounded-lg transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear all
          </button>
        )}
      </div>

      {/* Notification items */}
      <div className="overflow-y-auto flex-1 py-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <BellOff className="h-10 w-10 text-muted-foreground/60 mb-2 stroke-[1.5]" />
            <p className="text-sm font-medium text-foreground">All caught up!</p>
            <p className="text-xs text-muted-foreground mt-0.5">No notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            {notifications.map((notif) => (
              <div
                key={notif.id || notif._id}
                className={`flex gap-3 p-3 transition-colors duration-200 ${
                  !notif.read
                    ? 'bg-primary/5 hover:bg-primary/10'
                    : 'hover:bg-secondary/40'
                }`}
              >
                {/* Sender Avatar */}
                <UserAvatar user={notif.sender || { name: 'System' }} size="sm" showStatus={false} />

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground leading-normal break-words">
                    {notif.text}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground font-medium">
                    <Clock className="h-3 w-3" />
                    <span>{timeAgo(notif.createdAt)}</span>
                  </div>
                </div>

                {/* Mark as read tick */}
                {!notif.read && (
                  <button
                    onClick={(e) => handleMarkRead(e, notif.id || notif._id)}
                    className="self-center p-1 rounded-full text-primary hover:bg-primary/10 border border-primary/20 transition-all"
                    title="Mark as read"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
