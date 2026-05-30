import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useTasks } from '../context/TaskContext';
import { Plus, Search, Filter, Loader2, Sparkles } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { toast } from '../utils/toast';

const COLUMNS = ['Pending', 'In Progress', 'Completed'];

const columnStyles = {
  Pending: {
    bg: 'bg-slate-50/50 dark:bg-slate-900/10',
    border: 'border-slate-200/60 dark:border-slate-800/40',
    dot: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
  'In Progress': {
    bg: 'bg-indigo-50/20 dark:bg-indigo-950/10',
    border: 'border-indigo-100/50 dark:border-indigo-900/20',
    dot: 'bg-indigo-500',
    badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400',
  },
  Completed: {
    bg: 'bg-emerald-50/20 dark:bg-emerald-950/10',
    border: 'border-emerald-100/50 dark:border-emerald-900/20',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  },
};

const KanbanBoard = () => {
  const {
    filteredTasks,
    team,
    loading,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    updateTaskStatus,
    deleteTask
  } = useTasks();

  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a valid column
    if (!destination) return;

    // Dropped in the same spot
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const nextStatus = destination.droppableId;

    try {
      await updateTaskStatus(draggableId, nextStatus);
      toast.success(`Task moved to ${nextStatus}`);
    } catch (err) {
      toast.error('Failed to move task status');
    }
  };

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

  const handleCreateClick = (initialStatus) => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({ status: '', priority: '', assignedTo: '' });
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Kanban Board
          </h1>
          <p className="text-sm text-muted-foreground">
            Drag and drop cards across categories to update project status.
          </p>
        </div>
        <button
          onClick={() => handleCreateClick('Pending')}
          className="flex items-center justify-center gap-2 h-11 px-5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/95 transition-all shadow-md shadow-primary/25 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-5 w-5" />
          Create Task
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4.5 shadow-sm md:flex-row md:items-center justify-between">
        
        <div className="flex flex-col gap-3.5 sm:flex-row flex-1 max-w-3xl">
          {/* Priority filter */}
          <div className="flex-1 min-w-[130px]">
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="h-10 w-full rounded-xl border border-input/60 bg-background/50 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary text-foreground"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
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

        {/* Clear Filters CTA */}
        {(filters.priority || filters.assignedTo || searchQuery) && (
          <button
            onClick={clearFilters}
            className="h-10 text-xs font-semibold text-primary hover:underline hover:bg-secondary/40 px-4 rounded-xl transition-all self-start md:self-auto cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Kanban Board columns wrapper */}
      {loading && filteredTasks.length === 0 ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid gap-6 md:grid-cols-3 items-start">
            {COLUMNS.map((columnName) => {
              const columnTasks = filteredTasks.filter(
                (task) => task.status === columnName
              );
              const styles = columnStyles[columnName];

              return (
                <div
                  key={columnName}
                  className={`rounded-2xl border p-4 flex flex-col min-h-[500px] ${styles.bg} ${styles.border}`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/20">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} />
                      <h3 className="font-semibold text-foreground text-sm">
                        {columnName}
                      </h3>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${styles.badge}`}
                    >
                      {columnTasks.length}
                    </span>
                  </div>

                  {/* Tasks List Droppable Zone */}
                  <Droppable droppableId={columnName}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 flex flex-col gap-4 rounded-xl transition-colors duration-200 p-1 min-h-[350px] ${
                          snapshot.isDraggingOver
                            ? 'bg-secondary/30'
                            : 'bg-transparent'
                        }`}
                      >
                        {columnTasks.map((task, index) => (
                          <Draggable
                            key={task.id || task._id}
                            draggableId={task.id || task._id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="transition-transform duration-200"
                                style={{
                                  ...provided.draggableProps.style,
                                  opacity: snapshot.isDragging ? 0.8 : 1,
                                }}
                              >
                                <TaskCard
                                  task={task}
                                  onClick={handleCardClick}
                                  onEdit={handleEditClick}
                                  onDelete={handleDeleteClick}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {columnTasks.length === 0 && (
                          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border/40 rounded-2xl py-12 px-4 text-center select-none text-muted-foreground/60">
                            <Sparkles className="h-6 w-6 mb-1.5 stroke-[1.2]" />
                            <p className="text-[11px] font-medium">Empty Column</p>
                            <p className="text-[9px] mt-0.5 leading-normal">
                              Drag items here or click Create
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* Task Creation & Detail modal overlay */}
      <TaskModal
        isOpen={isModalOpen}
        task={selectedTask}
        onClose={() => setIsModalOpen(false)}
      />

    </div>
  );
};

export default KanbanBoard;
