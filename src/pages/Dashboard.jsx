import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import {
  ListTodo,
  CheckCircle2,
  Clock,
  Plus,
  Loader2,
  TrendingUp,
  MessageSquare,
  FileSpreadsheet
} from 'lucide-react';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import TeamPanel from '../components/TeamPanel';
import { toast } from '../utils/toast';

const Dashboard = () => {
  const { user } = useAuth();
  const { tasks, activities, loading, deleteTask } = useTasks();
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Compute Statistics
  const total = tasks.length;
  const pending = tasks.filter((t) => t.status === 'Pending').length;
  const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
  const completed = tasks.filter((t) => t.status === 'Completed').length;

  const completedPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Filter tasks assigned to currently logged in user
  const myTasks = tasks.filter((t) =>
    t.assignedTo?.some((u) => String(u.id || u._id || u) === String(user?.id || user?._id))
  );

  const handleCardClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleEditClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        toast.success('Task deleted successfully');
      } catch (err) {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleCreateClick = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const getStatsCards = () => [
    {
      name: 'Total Projects & Tasks',
      value: total,
      icon: <FileSpreadsheet className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />,
      bg: 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30',
    },
    {
      name: 'Pending Backlog',
      value: pending,
      icon: <ListTodo className="h-5 w-5 text-slate-500" />,
      bg: 'bg-slate-50/50 dark:bg-slate-900/20 border-slate-200/50 dark:border-slate-800/30',
    },
    {
      name: 'Active In Progress',
      value: inProgress,
      icon: <Clock className="h-5 w-5 text-amber-500" />,
      bg: 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30',
    },
    {
      name: 'Completed Milestones',
      value: completed,
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30',
    },
  ];

  if (loading && tasks.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none">
      
      {/* Upper Brand Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Workspace Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, <span className="font-semibold text-primary">{user?.name}</span>. Here is your team overview.
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          className="flex items-center justify-center gap-2 h-11 px-5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/95 transition-all shadow-md shadow-primary/25 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-5 w-5" />
          Create Task
        </button>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {getStatsCards().map((card) => (
          <div
            key={card.name}
            className={`p-6 border rounded-2xl flex items-center justify-between shadow-sm ${card.bg}`}
          >
            <div>
              <p className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
                {card.name}
              </p>
              <h3 className="text-3xl font-extrabold text-foreground mt-1">
                {card.value}
              </h3>
            </div>
            <div className="p-3 bg-card border rounded-xl shadow-sm">{card.icon}</div>
          </div>
        ))}
      </div>

      {/* Progress & Overview columns */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Left Column: Progress status chart / list */}
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6 shadow-sm flex flex-col justify-between min-h-[220px]">
          <div>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Workspace Delivery Efficiency
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Percentage of tasks successfully marked as Completed
            </p>
          </div>

          <div className="my-6">
            <div className="flex items-end justify-between font-bold text-foreground">
              <span className="text-3xl font-extrabold">{completedPercentage}%</span>
              <span className="text-xs text-muted-foreground font-semibold">
                {completed} of {total} tasks
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-3 w-full bg-secondary rounded-full mt-2.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completedPercentage}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 text-center border-t pt-4">
            <div>
              <span className="block text-xs font-bold text-slate-500">Backlog</span>
              <span className="text-sm font-extrabold text-foreground mt-0.5 block">{pending}</span>
            </div>
            <div className="border-x border-border">
              <span className="block text-xs font-bold text-amber-500">In Progress</span>
              <span className="text-sm font-extrabold text-foreground mt-0.5 block">{inProgress}</span>
            </div>
            <div>
              <span className="block text-xs font-bold text-emerald-500">Completed</span>
              <span className="text-sm font-extrabold text-foreground mt-0.5 block">{completed}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic team catalog panel */}
        <div className="lg:col-span-1">
          <TeamPanel />
        </div>

      </div>

      {/* Bottom Main Content split: Assigned tasks list vs Recent activities log */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Assigned tasks to user list */}
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6 shadow-sm flex flex-col">
          <h3 className="text-base font-semibold text-foreground mb-4 border-b pb-3">
            Assigned to Me
            <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-bold">
              {myTasks.length}
            </span>
          </h3>

          {myTasks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2 stroke-[1.5]" />
              <p className="text-sm font-semibold text-foreground">You are all clear!</p>
              <p className="text-xs text-muted-foreground mt-0.5">No tasks assigned to you right now.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {myTasks.map((task) => (
                <TaskCard
                  key={task.id || task._id}
                  task={task}
                  onClick={handleCardClick}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Activities Log */}
        <div className="lg:col-span-1 rounded-2xl border bg-card p-6 shadow-sm flex flex-col max-h-[480px]">
          <h3 className="text-base font-semibold text-foreground mb-4 border-b pb-3 flex items-center gap-2">
            <TrendingUp className="h-4.5 w-4.5 text-primary rotate-45" />
            Recent Activity
          </h3>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {activities.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-10">No recent team activities.</p>
            ) : (
              activities.slice(0, 8).map((act) => (
                <div key={act.id || act._id} className="flex gap-3 text-xs leading-relaxed">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mt-1" />
                    <div className="flex-1 w-[1px] bg-border/40 mt-1" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">
                      <span className="font-semibold">{act.user?.name || 'A user'}</span> {act.text}
                    </p>
                    <span className="block text-[9px] text-muted-foreground mt-1">
                      {new Date(act.createdAt).toLocaleDateString()} at {new Date(act.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Task Creation & Detail modal overlay */}
      <TaskModal
        isOpen={isModalOpen}
        task={selectedTask}
        onClose={() => setIsModalOpen(false)}
      />

    </div>
  );
};

export default Dashboard;
