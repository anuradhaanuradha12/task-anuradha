import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { Plus, Search, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Loader2, ArrowUpDown } from 'lucide-react';
import TaskModal from '../components/TaskModal';
import UserAvatar from '../components/UserAvatar';
import { toast } from '../utils/toast';

const priorityColors = {
  High: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30',
  Medium: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30',
  Low: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30',
};

const statusColors = {
  Pending: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  'In Progress': 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/30',
  Completed: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30',
};

const TaskListPage = () => {
  const {
    filteredTasks,
    team,
    loading,
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    deleteTask
  } = useTasks();

  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        toast.success('Task deleted successfully');
      } catch (err) {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleEdit = (e, task) => {
    e.stopPropagation();
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleRowClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setCurrentPage(1); // Reset page on filter
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({ status: '', priority: '', assignedTo: '' });
    setCurrentPage(1);
  };

  // 1. Apply Sorting
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let valA = a[sortField] || '';
    let valB = b[sortField] || '';

    if (sortField === 'dueDate') {
      valA = valA ? new Date(valA).getTime() : 0;
      valB = valB ? new Date(valB).getTime() : 0;
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // 2. Apply Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedTasks = sortedTasks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedTasks.length / itemsPerPage);

  return (
    <div className="space-y-6 select-none">
      
      {/* Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Task Catalog
          </h1>
          <p className="text-sm text-muted-foreground">
            View, sort and filter all project tasks in tabular format.
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

      {/* Filters Toolbar */}
      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4.5 shadow-sm md:flex-row md:items-center justify-between">
        <div className="flex flex-col gap-3.5 sm:flex-row flex-1 max-w-3xl">
          {/* Status Filter */}
          <div className="flex-1 min-w-[130px]">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="h-10 w-full rounded-xl border border-input/60 bg-background/50 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-foreground"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Priority filter */}
          <div className="flex-1 min-w-[130px]">
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="h-10 w-full rounded-xl border border-input/60 bg-background/50 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-foreground"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Assignee filter */}
          <div className="flex-1 min-w-[150px]">
            <select
              value={filters.assignedTo}
              onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
              className="h-10 w-full rounded-xl border border-input/60 bg-background/50 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-foreground"
            >
              <option value="">All Assignees</option>
              {team.map((member) => (
                <option key={member.id || member._id} value={member.id || member._id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear filters trigger */}
        {(filters.status || filters.priority || filters.assignedTo || searchQuery) && (
          <button
            onClick={clearFilters}
            className="h-10 text-xs font-semibold text-primary hover:underline hover:bg-secondary/40 px-4 rounded-xl transition-all self-start md:self-auto cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Main Table view */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        {loading && sortedTasks.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sortedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <p className="text-sm font-semibold text-foreground">No tasks matching search filters</p>
            <p className="text-xs text-muted-foreground mt-0.5">Try resetting the columns dropdown filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b bg-secondary/20 text-muted-foreground/90 font-bold uppercase tracking-wider select-none">
                  <th
                    onClick={() => handleSort('title')}
                    className="p-4 cursor-pointer hover:text-foreground transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      Task Description
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </div>
                  </th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Priority</th>
                  <th
                    onClick={() => handleSort('dueDate')}
                    className="p-4 cursor-pointer hover:text-foreground transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      Due Date
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </div>
                  </th>
                  <th className="p-4">Assigned To</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedTasks.map((task) => (
                  <tr
                    key={task.id || task._id}
                    onClick={() => handleRowClick(task)}
                    className="hover:bg-secondary/20 cursor-pointer transition-colors"
                  >
                    {/* Title & Description */}
                    <td className="p-4 max-w-sm">
                      <p className="font-semibold text-foreground truncate">{task.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                        {task.description || 'No description provided.'}
                      </p>
                    </td>

                    {/* Status badge */}
                    <td className="p-4">
                      <span
                        className={`font-bold px-2.5 py-0.5 rounded-md border text-[9px] uppercase tracking-wider ${
                          statusColors[task.status] || statusColors.Pending
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>

                    {/* Priority badge */}
                    <td className="p-4">
                      <span
                        className={`font-bold px-2.5 py-0.5 rounded-md border text-[9px] uppercase tracking-wider ${
                          priorityColors[task.priority] || priorityColors.Medium
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    {/* Due Date */}
                    <td className="p-4 font-medium text-muted-foreground">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'No due date'}
                    </td>

                    {/* Assignees */}
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex -space-x-2 overflow-hidden">
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
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRowClick(task)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => handleEdit(e, task)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
                          title="Edit Task"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, task.id || task._id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                          title="Delete Task"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t p-4 select-none">
            <span className="text-[10px] font-semibold text-muted-foreground">
              Showing {indexOfFirstItem + 1} to{' '}
              {Math.min(indexOfLastItem, sortedTasks.length)} of{' '}
              {sortedTasks.length} tasks
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="h-8 w-8 flex items-center justify-center rounded-lg border text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-[11px] font-bold text-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="h-8 w-8 flex items-center justify-center rounded-lg border text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
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

export default TaskListPage;
