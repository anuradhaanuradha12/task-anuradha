import React from 'react';
import { useTasks } from '../context/TaskContext';
import { useSocket } from '../context/SocketContext';
import UserAvatar from './UserAvatar';
import { Users, ShieldAlert, Award, User } from 'lucide-react';

const TeamPanel = () => {
  const { team } = useTasks();
  const { onlineUsers } = useSocket();

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin':
        return <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />;
      case 'Manager':
        return <Award className="h-3.5 w-3.5 text-blue-500" />;
      default:
        return <User className="h-3.5 w-3.5 text-slate-500" />;
    }
  };

  const getRoleStyles = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30';
      case 'Manager':
        return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
    }
  };

  const checkOnline = (userId) => {
    return onlineUsers.some((u) => String(u.id || u._id) === String(userId));
  };

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col h-full">
      {/* Header */}
      <h3 className="text-base font-semibold text-foreground flex items-center gap-2 mb-4 border-b border-border pb-3">
        <Users className="h-5 w-5 text-primary" />
        Collaboration Panel
        <span className="ml-auto bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-bold">
          {team.length}
        </span>
      </h3>

      {/* Users List */}
      <div className="space-y-3.5 overflow-y-auto flex-1 max-h-[350px] pr-1">
        {team.map((member) => {
          const isOnline = checkOnline(member.id || member._id);
          return (
            <div
              key={member.id || member._id}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/40 transition-colors"
            >
              {/* Avatar */}
              <UserAvatar user={member} size="sm" showStatus={true} />

              {/* User details */}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate">
                  {member.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {member.email}
                </p>
              </div>

              {/* Role badge */}
              <div
                className={`flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getRoleStyles(
                  member.role
                )}`}
              >
                {getRoleIcon(member.role)}
                <span>{member.role}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamPanel;
