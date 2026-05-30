import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignedTo: ''
  });

  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await taskService.getTasks();
      setTasks(data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchActivities = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await taskService.getActivities();
      setActivities(data || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
    }
  }, [isAuthenticated]);

  const fetchTeam = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await taskService.getTeam();
      setTeam(data || []);
    } catch (err) {
      console.error('Error fetching team:', err);
    }
  }, [isAuthenticated]);

  // Load initial data
  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
      fetchActivities();
      fetchTeam();
    } else {
      setTasks([]);
      setActivities([]);
      setTeam([]);
    }
  }, [isAuthenticated, fetchTasks, fetchActivities, fetchTeam]);

  // Real-time synchronization
  useEffect(() => {
    // 1. WebSocket listeners
    if (socket) {
      const handleTaskUpdate = (data) => {
        console.log('Real-time task update received:', data);
        fetchTasks();
        fetchActivities();
      };
      
      socket.on('task-update', handleTaskUpdate);
      
      return () => {
        socket.off('task-update', handleTaskUpdate);
      };
    }
  }, [socket, fetchTasks, fetchActivities]);

  // 2. Offline simulation listener
  useEffect(() => {
    const handleSimulatedUpdate = () => {
      fetchTasks();
      fetchActivities();
    };
    window.addEventListener('db-update', handleSimulatedUpdate);
    return () => {
      window.removeEventListener('db-update', handleSimulatedUpdate);
    };
  }, [fetchTasks, fetchActivities]);

  const createTask = async (taskData) => {
    try {
      const newTask = await taskService.createTask(taskData);
      setTasks(prev => [newTask, ...prev]);
      fetchActivities();
      return newTask;
    } catch (err) {
      console.error('Error creating task:', err);
      throw err;
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      const updated = await taskService.updateTask(id, taskData);
      setTasks(prev => prev.map(t => (t.id === id || t._id === id ? updated : t)));
      fetchActivities();
      return updated;
    } catch (err) {
      console.error('Error updating task:', err);
      throw err;
    }
  };

  const deleteTask = async (id) => {
    try {
      await taskService.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id && t._id !== id));
      fetchActivities();
    } catch (err) {
      console.error('Error deleting task:', err);
      throw err;
    }
  };

  const updateTaskStatus = async (id, status) => {
    try {
      const updated = await taskService.updateTask(id, { status });
      setTasks(prev => prev.map(t => (t.id === id || t._id === id ? updated : t)));
      fetchActivities();
      return updated;
    } catch (err) {
      console.error('Error updating task status:', err);
      throw err;
    }
  };

  const addComment = async (taskId, text) => {
    try {
      const updated = await taskService.addComment(taskId, text);
      setTasks(prev => prev.map(t => (t.id === taskId || t._id === taskId ? updated : t)));
      fetchActivities();
      return updated;
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
  };

  // Helper to filter tasks locally for immediate UI response
  const getFilteredTasks = useCallback(() => {
    return tasks.filter(task => {
      // 1. Search Query Filter (Title or Description)
      const matchesSearch = 
        task.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Status Filter
      const matchesStatus = !filters.status || task.status === filters.status;
      
      // 3. Priority Filter
      const matchesPriority = !filters.priority || task.priority === filters.priority;
      
      // 4. Assignee Filter
      const matchesAssignee = !filters.assignedTo || 
        task.assignedTo?.some(user => {
          const userId = user.id || user._id || user;
          return String(userId) === String(filters.assignedTo);
        });

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });
  }, [tasks, searchQuery, filters]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        filteredTasks: getFilteredTasks(),
        activities,
        team,
        loading,
        searchQuery,
        setSearchQuery,
        filters,
        setFilters,
        createTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        addComment,
        refreshTasks: fetchTasks,
        refreshActivities: fetchActivities,
        refreshTeam: fetchTeam
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
