import React, { useState, useRef, useEffect } from 'react';
import { Calendar, MessageSquare, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import UserAvatar from './UserAvatar';

const priorityDots = {
  High: 'bg-rose-500',
  Medium: 'bg-amber-500',
  Low: 'bg-zinc-400',
};

const statusColors = {
  Pending: 'text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800',
  'In Progress': 'text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800',
  Completed: 'text-zinc-400 dark:text-zinc-500 line-through border-zinc-200 dark:border-zinc-800',
};

const TaskCard = ({ task, onClick, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const clickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const handleMenuClick = (e, action) => {
    e.stopPropagation();
    setShowMenu(false);
    if (action === 'edit') onEdit(task);
    if (action === 'delete') onDelete(task.id || task._id);
  };

  const formattedDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : 'No due date';

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed';

  return (
    <div
      onClick={() => onClick(task)}
      className="group relative rounded-xl border bg-card p-4 hover:bg-secondary/15 transition-all duration-200 cursor-pointer border-border hover:border-zinc-400 dark:hover:border-zinc-600 flex flex-col gap-3 select-none shadow-none"
    >
      {/* Header Badges */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Minimal Priority Dot */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-border text-[9px] font-bold text-muted-foreground uppercase tracking-wider bg-background/50">
            <span className={`h-1.5 w-1.5 rounded-full ${priorityDots[task.priority] || priorityDots.Medium}`} />
            {task.priority}
          </div>
          <span
            className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider md:hidden ${
              statusColors[task.status] || statusColors.Pending
            }`}
          >
            {task.status}
          </span>
        </div>

        {/* Options Menu Button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <MoreVertical className="h-4.5 w-4.5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-28 rounded-xl border shadow-xl bg-card p-1 z-10 animate-slide-in">
              <button
                onClick={(e) => handleMenuClick(e, 'edit')}
                className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground rounded-lg transition-colors"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit task
              </button>
              <button
                onClick={(e) => handleMenuClick(e, 'delete')}
                className="flex w-full items-center gap-2 px-2.5 py-1.5 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Title & Description */}
      <div className="min-w-0">
        <h4 className="font-semibold text-foreground text-sm leading-snug group-hover:text-primary transition-colors truncate">
          {task.title}
        </h4>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
          {task.description || 'No description provided.'}
        </p>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between border-t border-border/40 pt-3.5 mt-auto">
        {/* Due Date Indicator */}
        <div
          className={`flex items-center gap-1.5 text-[10px] font-medium ${
            isOverdue
              ? 'text-rose-500 font-semibold'
              : 'text-muted-foreground'
          }`}
        >
          <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{formattedDate}</span>
        </div>

        {/* Assigned Users Overlap avatars list */}
        <div className="flex items-center gap-2">
          {task.comments && task.comments.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mr-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{task.comments.length}</span>
            </div>
          )}
          
          <div className="flex -space-x-2.5 overflow-hidden">
            {task.assignedTo?.slice(0, 3).map((user) => (
              <UserAvatar
                key={user.id || user._id || user}
                user={user}
                size="xs"
                showStatus={false}
              />
            ))}
            {task.assignedTo?.length > 3 && (
              <div className="flex items-center justify-center rounded-full bg-slate-200 border border-card h-6 w-6 text-[8px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                +{task.assignedTo.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default TaskCard;
