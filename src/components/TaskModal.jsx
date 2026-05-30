import React, { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { toast } from '../utils/toast';
import { X, Send, Calendar, CheckSquare, MessageSquare, ListCollapse, Clock } from 'lucide-react';
import UserAvatar from './UserAvatar';

const TaskModal = ({ isOpen, task, onClose }) => {
  const { user: currentUser } = useAuth();
  const { team, createTask, updateTask, addComment } = useTasks();

  const isEditMode = !!task;

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState([]);
  
  // Comments state
  const [commentText, setCommentText] = useState('');

  // Hydrate fields on open/edit change
  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title || '');
        setDescription(task.description || '');
        setStatus(task.status || 'Pending');
        setPriority(task.priority || 'Medium');
        setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
        setAssignedTo(task.assignedTo?.map(u => u.id || u._id || u) || []);
      } else {
        setTitle('');
        setDescription('');
        setStatus('Pending');
        setPriority('Medium');
        setDueDate('');
        setAssignedTo([]);
      }
    }
  }, [isOpen, task]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Task title is required');
      return;
    }

    const payload = {
      title,
      description,
      status,
      priority,
      dueDate: dueDate || undefined,
      assignedTo,
    };

    try {
      if (isEditMode) {
        await updateTask(task.id || task._id, payload);
        toast.success('Task details updated successfully');
      } else {
        await createTask(payload);
        toast.success('Task created successfully');
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save task');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await addComment(task.id || task._id, commentText);
      setCommentText('');
      toast.success('Comment posted');
    } catch (err) {
      toast.error('Failed to post comment');
    }
  };

  const toggleAssignee = (userId) => {
    setAssignedTo(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-card border rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-in"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/40 select-none">
          <h3 className="text-base font-bold text-foreground">
            {isEditMode ? 'Task Details & Activity' : 'Create New Task'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content body split into 2 columns on large devices */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
          
          {/* LEFT COLUMN: Main Form & Comments */}
          <div className="flex-1 flex flex-col gap-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Task Title */}
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Build backend routes"
                  className="w-full h-11 px-4 text-sm font-semibold rounded-xl border border-input bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all text-foreground"
                />
              </div>

              {/* Task Description */}
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the instructions or technical outline..."
                  rows={4}
                  className="w-full p-4 text-sm rounded-xl border border-input bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all text-foreground resize-none leading-relaxed"
                />
              </div>

              {/* Main CTA */}
              <button
                type="submit"
                className="h-11 w-full bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/95 transition-all shadow-md shadow-primary/10 mt-2 cursor-pointer"
              >
                {isEditMode ? 'Save Details' : 'Create Task'}
              </button>
            </form>

            {/* Comments Thread (Only in Edit Mode) */}
            {isEditMode && (
              <div className="border-t border-border/40 pt-6 mt-2 flex flex-col gap-4">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider select-none">
                  <MessageSquare className="h-4.5 w-4.5 text-primary" />
                  Comments Thread
                </h4>

                {/* Comment Input */}
                <form onSubmit={handleCommentSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a status update or query..."
                    className="flex-1 h-10 px-4 text-xs rounded-xl border border-input bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary transition-all text-foreground"
                  />
                  <button
                    type="submit"
                    className="h-10 w-10 flex items-center justify-center bg-primary text-primary-foreground rounded-xl hover:bg-primary/95 transition-colors cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>

                {/* Comment Thread List */}
                <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                  {task.comments?.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4 select-none">
                      No discussions yet. Be the first to comment!
                    </p>
                  ) : (
                    task.comments?.map((comment) => (
                      <div key={comment.id || comment._id} className="flex gap-3 text-xs leading-relaxed">
                        <UserAvatar user={comment.user} size="sm" showStatus={false} />
                        <div className="flex-1 bg-secondary/30 border p-3 rounded-2xl">
                          <div className="flex items-center justify-between mb-1 select-none">
                            <span className="font-semibold text-foreground">{comment.user?.name}</span>
                            <span className="text-[9px] text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <p className="text-muted-foreground">{comment.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Metadata & Settings Controls */}
          <div className="w-full lg:w-72 flex flex-col gap-6 lg:border-l lg:border-border/40 lg:pl-8 select-none">
            
            {/* Status Selector */}
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-input bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-foreground"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Priority Selector */}
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-input bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-foreground"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* Due Date picker */}
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-10 px-4 text-xs font-semibold rounded-xl border border-input bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-foreground"
              />
            </div>

            {/* Assigned to Collaborators checklist */}
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2 flex items-center gap-1">
                <CheckSquare className="h-3.5 w-3.5" />
                Assign Team Members
              </label>
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                {team.map((member) => (
                  <div
                    key={member.id || member._id}
                    onClick={() => toggleAssignee(member.id || member._id)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition-all ${
                      assignedTo.includes(member.id || member._id)
                        ? 'bg-primary/5 border-primary/30'
                        : 'border-transparent hover:bg-secondary/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={assignedTo.includes(member.id || member._id)}
                      onChange={() => {}} // Controlled by onClick container
                      className="rounded border-input text-primary focus:ring-primary/45 h-3.5 w-3.5"
                    />
                    <UserAvatar user={member} size="xs" showStatus={false} />
                    <span className="text-xs font-medium text-foreground truncate">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Logs (Only in Edit Mode) */}
            {isEditMode && task.activities && (
              <div className="border-t border-border/40 pt-4 mt-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Task Audit Logs
                </label>
                <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                  {task.activities?.map((act) => (
                    <div key={act.id || act._id} className="text-[10px] text-muted-foreground leading-relaxed flex gap-2">
                      <span className="text-primary font-bold text-[8px] mt-0.5">•</span>
                      <div>
                        <span>{act.text}</span>
                        <span className="block text-[8px] opacity-75 mt-0.5">
                          {new Date(act.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default TaskModal;
