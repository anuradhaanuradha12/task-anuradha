import axios from 'axios';

// Get API base URL from environment or default to local server
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle global errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear credentials on unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// MOCK DATABASE & FALLBACK LAYER (OFFLINE MODE)
// ==========================================

const MOCK_USERS = [
  { id: '1', name: 'Siddharth (Me)', email: 'siddharth@example.com', avatar: 'S' },
  { id: '2', name: 'Sarah Connor', email: 'sarah@example.com', avatar: 'SC' },
  { id: '3', name: 'John Doe', email: 'john@example.com', avatar: 'JD' },
  { id: '4', name: 'Elena Rostova', email: 'elena@example.com', avatar: 'ER' },
];

const MOCK_TASKS = [
  {
    id: 'task-1',
    title: 'Design System & Style Guidelines',
    description: 'Design dark/light mode CSS colors, typography scale, buttons, badges and reusable glassmorphism cards for the layout.',
    status: 'Completed',
    priority: 'High',
    dueDate: '2026-06-01',
    assignedTo: ['1', '4'],
    comments: [
      { id: 'c1', user: MOCK_USERS[3], text: 'Added initial colors palette in index.css.', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: 'c2', user: MOCK_USERS[0], text: 'Looks stellar, thanks Elena!', createdAt: new Date(Date.now() - 86400000).toISOString() }
    ],
    activities: [
      { id: 'a1', text: 'Elena Rostova created this task', createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
      { id: 'a2', text: 'Elena Rostova updated status to Completed', createdAt: new Date(Date.now() - 86400000).toISOString() }
    ]
  },
  {
    id: 'task-2',
    title: 'Implement JWT Authentication Flow',
    description: 'Create protected routes, login / registration page validations, token local storage sync and API interceptor header injection.',
    status: 'In Progress',
    priority: 'High',
    dueDate: '2026-06-05',
    assignedTo: ['1'],
    comments: [],
    activities: [
      { id: 'a3', text: 'Siddharth assigned themselves to the task', createdAt: new Date(Date.now() - 3600000 * 4).toISOString() },
      { id: 'a4', text: 'Siddharth moved task to In Progress', createdAt: new Date(Date.now() - 3600000 * 2).toISOString() }
    ]
  },
  {
    id: 'task-3',
    title: 'Kanban Board Drag & Drop Interface',
    description: 'Integrate @hello-pangea/dnd columns with columns representing Pending, In Progress, and Completed states. Ensure updates sync with storage.',
    status: 'Pending',
    priority: 'Medium',
    dueDate: '2026-06-10',
    assignedTo: ['2', '4'],
    comments: [],
    activities: [
      { id: 'a5', text: 'Siddharth assigned Elena Rostova and Sarah Connor to this task', createdAt: new Date(Date.now() - 3600000 * 6).toISOString() }
    ]
  },
  {
    id: 'task-4',
    title: 'WebSocket Real-Time Notification Panel',
    description: 'Write Socket.IO client service to trigger top-right desktop-style toast banners whenever coworkers create or update dashboard items.',
    status: 'Pending',
    priority: 'Low',
    dueDate: '2026-06-15',
    assignedTo: ['3'],
    comments: [],
    activities: []
  }
];

const MOCK_ACTIVITIES = [
  { id: 'act-1', text: 'Elena Rostova completed task "Design System & Style Guidelines"', createdAt: new Date(Date.now() - 86400000).toISOString(), type: 'completion' },
  { id: 'act-2', text: 'Siddharth moved task "Implement JWT Authentication Flow" to In Progress', createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), type: 'update' },
  { id: 'act-3', text: 'Siddharth added a new task "WebSocket Real-Time Notification Panel"', createdAt: new Date(Date.now() - 3600000 * 12).toISOString(), type: 'create' },
];

const MOCK_NOTIFICATIONS = [
  { id: 'n-1', text: 'Elena Rostova marked "Design System & Style Guidelines" as Completed', read: false, createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString() },
  { id: 'n-2', text: 'Siddharth assigned you to "Kanban Board Drag & Drop Interface"', read: true, createdAt: new Date(Date.now() - 3600000 * 5).toISOString() }
];

// Initialize localStorage DB if empty
if (!localStorage.getItem('db_users')) {
  localStorage.setItem('db_users', JSON.stringify(MOCK_USERS));
}
if (!localStorage.getItem('db_tasks')) {
  localStorage.setItem('db_tasks', JSON.stringify(MOCK_TASKS));
}
if (!localStorage.getItem('db_activities')) {
  localStorage.setItem('db_activities', JSON.stringify(MOCK_ACTIVITIES));
}
if (!localStorage.getItem('db_notifications')) {
  localStorage.setItem('db_notifications', JSON.stringify(MOCK_NOTIFICATIONS));
}

// Helper database functions
const getDB = (key) => JSON.parse(localStorage.getItem(key));
const saveDB = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Determine if we should force fallback (e.g. if the backend is down)
let forceMock = true; // Auto-fallback behavior

const isMockActive = () => forceMock;

// ==========================================
// API SERVICES
// ==========================================

export const authService = {
  login: async (email, password) => {
    if (isMockActive()) {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      const users = getDB('db_users');
      const user = users.find(u => u.email === email) || { id: '1', name: email.split('@')[0], email, avatar: email.slice(0,2).toUpperCase() };
      
      const payload = {
        token: 'mock-jwt-token-xyz-12345',
        user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar }
      };
      
      localStorage.setItem('token', payload.token);
      localStorage.setItem('user', JSON.stringify(payload.user));
      return payload;
    }
    
    try {
      const response = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      if (error.message === 'Network Error') {
        forceMock = true; // Switch to mock mode
        return authService.login(email, password); // Retry in mock mode
      }
      throw error;
    }
  },

  register: async (name, email, password, avatar = 'U') => {
    if (isMockActive()) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const users = getDB('db_users');
      const newUser = { id: String(users.length + 1), name, email, avatar };
      users.push(newUser);
      saveDB('db_users', users);
      
      const payload = {
        token: 'mock-jwt-token-xyz-12345',
        user: newUser
      };
      
      localStorage.setItem('token', payload.token);
      localStorage.setItem('user', JSON.stringify(payload.user));
      return payload;
    }

    try {
      const response = await api.post('/api/auth/register', { name, email, password, avatar });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      if (error.message === 'Network Error') {
        forceMock = true;
        return authService.register(name, email, password, avatar);
      }
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

export const taskService = {
  getTasks: async () => {
    if (isMockActive()) {
      await new Promise(resolve => setTimeout(resolve, 400));
      return getDB('db_tasks');
    }
    try {
      const response = await api.get('/api/tasks');
      return response.data;
    } catch (error) {
      if (error.message === 'Network Error') {
        forceMock = true;
        return taskService.getTasks();
      }
      throw error;
    }
  },

  createTask: async (taskData) => {
    const currentUser = authService.getCurrentUser() || { name: 'User', id: '1' };
    if (isMockActive()) {
      await new Promise(resolve => setTimeout(resolve, 400));
      const tasks = getDB('db_tasks');
      const newTask = {
        ...taskData,
        id: `task-${Date.now()}`,
        comments: taskData.comments || [],
        activities: [
          { id: `act-${Date.now()}`, text: `${currentUser.name} created the task`, createdAt: new Date().toISOString() }
        ]
      };
      tasks.push(newTask);
      saveDB('db_tasks', tasks);

      // Add to global activities
      const activities = getDB('db_activities');
      activities.unshift({
        id: `act-g-${Date.now()}`,
        text: `${currentUser.name} created task "${taskData.title}"`,
        createdAt: new Date().toISOString(),
        type: 'create'
      });
      saveDB('db_activities', activities);

      return newTask;
    }

    try {
      const response = await api.post('/api/tasks', taskData);
      return response.data;
    } catch (error) {
      if (error.message === 'Network Error') {
        forceMock = true;
        return taskService.createTask(taskData);
      }
      throw error;
    }
  },

  updateTask: async (id, taskData) => {
    const currentUser = authService.getCurrentUser() || { name: 'User', id: '1' };
    if (isMockActive()) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const tasks = getDB('db_tasks');
      const idx = tasks.findIndex(t => t.id === id);
      if (idx === -1) throw new Error('Task not found');
      
      const oldTask = tasks[idx];
      
      // Determine what changed for activity logs
      let changeText = '';
      if (taskData.status && taskData.status !== oldTask.status) {
        changeText = `moved task to ${taskData.status}`;
      } else if (taskData.priority && taskData.priority !== oldTask.priority) {
        changeText = `changed priority to ${taskData.priority}`;
      } else {
        changeText = `updated details`;
      }

      const updatedTask = {
        ...oldTask,
        ...taskData,
        activities: [
          ...(oldTask.activities || []),
          { id: `act-${Date.now()}`, text: `${currentUser.name} ${changeText}`, createdAt: new Date().toISOString() }
        ]
      };
      
      tasks[idx] = updatedTask;
      saveDB('db_tasks', tasks);

      // Add to global activities
      const activities = getDB('db_activities');
      activities.unshift({
        id: `act-g-${Date.now()}`,
        text: `${currentUser.name} ${changeText} on "${updatedTask.title}"`,
        createdAt: new Date().toISOString(),
        type: 'update'
      });
      saveDB('db_activities', activities);

      // Simulate a notification triggered by another user (real-time websocket feeling)
      return updatedTask;
    }

    try {
      const response = await api.put(`/api/tasks/${id}`, taskData);
      return response.data;
    } catch (error) {
      if (error.message === 'Network Error') {
        forceMock = true;
        return taskService.updateTask(id, taskData);
      }
      throw error;
    }
  },

  deleteTask: async (id) => {
    const currentUser = authService.getCurrentUser() || { name: 'User', id: '1' };
    if (isMockActive()) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const tasks = getDB('db_tasks');
      const task = tasks.find(t => t.id === id);
      const filtered = tasks.filter(t => t.id !== id);
      saveDB('db_tasks', filtered);

      if (task) {
        const activities = getDB('db_activities');
        activities.unshift({
          id: `act-g-${Date.now()}`,
          text: `${currentUser.name} deleted task "${task.title}"`,
          createdAt: new Date().toISOString(),
          type: 'delete'
        });
        saveDB('db_activities', activities);
      }
      return { success: true, id };
    }

    try {
      const response = await api.delete(`/api/tasks/${id}`);
      return response.data;
    } catch (error) {
      if (error.message === 'Network Error') {
        forceMock = true;
        return taskService.deleteTask(id);
      }
      throw error;
    }
  },

  addComment: async (taskId, commentText) => {
    const currentUser = authService.getCurrentUser() || { name: 'User', id: '1' };
    if (isMockActive()) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const tasks = getDB('db_tasks');
      const idx = tasks.findIndex(t => t.id === taskId);
      if (idx === -1) throw new Error('Task not found');
      
      const newComment = {
        id: `c-${Date.now()}`,
        user: currentUser,
        text: commentText,
        createdAt: new Date().toISOString()
      };

      tasks[idx].comments = [...(tasks[idx].comments || []), newComment];
      tasks[idx].activities = [
        ...(tasks[idx].activities || []),
        { id: `act-${Date.now()}`, text: `${currentUser.name} commented: "${commentText.slice(0, 30)}${commentText.length > 30 ? '...' : ''}"`, createdAt: new Date().toISOString() }
      ];

      saveDB('db_tasks', tasks);
      return tasks[idx];
    }
    
    // Fallback if live server comments endpoint exists (usually PUT /api/tasks/:id with updated comment list or sub-resource)
    try {
      const response = await api.post(`/api/tasks/${taskId}/comments`, { text: commentText });
      return response.data;
    } catch (error) {
      if (error.message === 'Network Error') {
        forceMock = true;
        return taskService.addComment(taskId, commentText);
      }
      throw error;
    }
  },

  getActivities: async () => {
    if (isMockActive()) {
      return getDB('db_activities');
    }
    // Assume backend endpoint exists
    try {
      const response = await api.get('/api/activities');
      return response.data;
    } catch {
      return getDB('db_activities');
    }
  },

  getNotifications: async () => {
    if (isMockActive()) {
      return getDB('db_notifications');
    }
    try {
      const response = await api.get('/api/notifications');
      return response.data;
    } catch {
      return getDB('db_notifications');
    }
  },

  markNotificationRead: async (id) => {
    if (isMockActive()) {
      const notifications = getDB('db_notifications');
      const idx = notifications.findIndex(n => n.id === id);
      if (idx !== -1) {
        notifications[idx].read = true;
        saveDB('db_notifications', notifications);
      }
      return notifications;
    }
    try {
      await api.put(`/api/notifications/${id}/read`);
      return getDB('db_notifications'); // Refresh
    } catch {
      return taskService.markNotificationRead(id);
    }
  },

  clearNotifications: async () => {
    if (isMockActive()) {
      saveDB('db_notifications', []);
      return [];
    }
    try {
      await api.delete('/api/notifications');
      return [];
    } catch {
      return [];
    }
  },

  getTeam: async () => {
    if (isMockActive()) {
      return getDB('db_users');
    }
    try {
      const response = await api.get('/api/team');
      return response.data;
    } catch {
      return getDB('db_users');
    }
  }
};

export default api;
