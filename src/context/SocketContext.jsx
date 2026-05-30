import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { taskService } from '../services/api';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [latestNotification, setLatestNotification] = useState(null);
  const simulationTimerRef = useRef(null);

  // Load initial notifications
  useEffect(() => {
    if (isAuthenticated) {
      taskService.getNotifications().then(data => {
        setNotifications(data || []);
      });
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setOnlineUsers([]);
      return;
    }

    const socketUrl = import.meta.env.VITE_WS_URL || 'http://localhost:5000';
    let socketInstance = null;

    try {
      socketInstance = io(socketUrl, {
        auth: {
          token: localStorage.getItem('token'),
        },
        autoConnect: false,
        reconnectionAttempts: 3,
        timeout: 5000,
      });

      socketInstance.connect();
      setSocket(socketInstance);

      socketInstance.on('connect', () => {
        console.log('Connected to real-time WebSocket backend');
      });

      socketInstance.on('online-users', (users) => {
        setOnlineUsers(users);
      });

      socketInstance.on('notification', (notif) => {
        setNotifications((prev) => [notif, ...prev]);
        setLatestNotification(notif);
        // Play notification sound or trigger toast
      });

      socketInstance.on('connect_error', () => {
        console.warn('WebSocket connection failed. Running in offline/mock collaboration mode.');
        setupOfflineSimulation();
      });

    } catch (err) {
      console.warn('Could not initialize WebSocket. Running in offline/mock collaboration mode.');
      setupOfflineSimulation();
    }

    // Clean up
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
      if (simulationTimerRef.current) {
        clearInterval(simulationTimerRef.current);
      }
    };
  }, [isAuthenticated, user]);

  // Fallback simulator for offline mode
  const setupOfflineSimulation = () => {
    // Populate seed online users
    const mockUsers = JSON.parse(localStorage.getItem('db_users') || '[]');
    setOnlineUsers(mockUsers.map(u => ({ ...u, status: Math.random() > 0.3 ? 'online' : 'offline' })));

    // Clear active simulation timers to avoid leaks
    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
    }

    // Trigger dynamic collaborative events every 30 seconds
    simulationTimerRef.current = setInterval(() => {
      const activeUsers = mockUsers.filter(u => u.id !== user.id);
      if (activeUsers.length === 0) return;

      const randomUser = activeUsers[Math.floor(Math.random() * activeUsers.length)];
      const dbTasks = JSON.parse(localStorage.getItem('db_tasks') || '[]');
      if (dbTasks.length === 0) return;
      
      const randomTask = dbTasks[Math.floor(Math.random() * dbTasks.length)];
      
      const eventTypes = [
        'comment',
        'status_change',
        'priority_change',
        'online_toggle'
      ];
      const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      
      let notificationText = '';
      
      if (randomEvent === 'comment') {
        const mockComments = [
          'Agreed. Let me know if you need help with this!',
          'I am reviewing the designs and they look great.',
          'Let me push a quick fix for this soon.',
          'Is the API documentation available for this task?'
        ];
        const commentText = mockComments[Math.floor(Math.random() * mockComments.length)];
        
        // Update task comments in localStorage
        const updatedTasks = dbTasks.map(t => {
          if (t.id === randomTask.id) {
            const newComment = {
              id: `c-sim-${Date.now()}`,
              user: randomUser,
              text: commentText,
              createdAt: new Date().toISOString()
            };
            return {
              ...t,
              comments: [...(t.comments || []), newComment],
              activities: [
                ...(t.activities || []),
                { id: `act-sim-${Date.now()}`, text: `${randomUser.name} commented: "${commentText}"`, createdAt: new Date().toISOString() }
              ]
            };
          }
          return t;
        });
        
        localStorage.setItem('db_tasks', JSON.stringify(updatedTasks));
        notificationText = `${randomUser.name} commented on "${randomTask.title}"`;
        
        // Add to global activities
        const activities = JSON.parse(localStorage.getItem('db_activities') || '[]');
        activities.unshift({
          id: `act-g-${Date.now()}`,
          text: `${randomUser.name} commented on "${randomTask.title}": "${commentText}"`,
          createdAt: new Date().toISOString(),
          type: 'update'
        });
        localStorage.setItem('db_activities', JSON.stringify(activities));

      } else if (randomEvent === 'status_change') {
        const statuses = ['Pending', 'In Progress', 'Completed'];
        const nextStatus = statuses.filter(s => s !== randomTask.status)[Math.floor(Math.random() * 2)];
        
        const updatedTasks = dbTasks.map(t => {
          if (t.id === randomTask.id) {
            return {
              ...t,
              status: nextStatus,
              activities: [
                ...(t.activities || []),
                { id: `act-sim-${Date.now()}`, text: `${randomUser.name} moved status to ${nextStatus}`, createdAt: new Date().toISOString() }
              ]
            };
          }
          return t;
        });
        
        localStorage.setItem('db_tasks', JSON.stringify(updatedTasks));
        notificationText = `${randomUser.name} moved "${randomTask.title}" to ${nextStatus}`;
        
        // Add to global activities
        const activities = JSON.parse(localStorage.getItem('db_activities') || '[]');
        activities.unshift({
          id: `act-g-${Date.now()}`,
          text: `${randomUser.name} moved "${randomTask.title}" to ${nextStatus}`,
          createdAt: new Date().toISOString(),
          type: 'update'
        });
        localStorage.setItem('db_activities', JSON.stringify(activities));

      } else if (randomEvent === 'priority_change') {
        const priorities = ['Low', 'Medium', 'High'];
        const nextPriority = priorities.filter(p => p !== randomTask.priority)[Math.floor(Math.random() * 2)];
        
        const updatedTasks = dbTasks.map(t => {
          if (t.id === randomTask.id) {
            return {
              ...t,
              priority: nextPriority,
              activities: [
                ...(t.activities || []),
                { id: `act-sim-${Date.now()}`, text: `${randomUser.name} changed priority to ${nextPriority}`, createdAt: new Date().toISOString() }
              ]
            };
          }
          return t;
        });
        
        localStorage.setItem('db_tasks', JSON.stringify(updatedTasks));
        notificationText = `${randomUser.name} updated priority of "${randomTask.title}" to ${nextPriority}`;

        // Add to global activities
        const activities = JSON.parse(localStorage.getItem('db_activities') || '[]');
        activities.unshift({
          id: `act-g-${Date.now()}`,
          text: `${randomUser.name} set priority of "${randomTask.title}" to ${nextPriority}`,
          createdAt: new Date().toISOString(),
          type: 'update'
        });
        localStorage.setItem('db_activities', JSON.stringify(activities));

      } else if (randomEvent === 'online_toggle') {
        setOnlineUsers(prev => prev.map(u => {
          if (u.id === randomUser.id) {
            const nextStatus = u.status === 'online' ? 'offline' : 'online';
            return { ...u, status: nextStatus };
          }
          return u;
        }));
        return; // Don't trigger notification for simple online toggles to reduce noise
      }

      // Add to notifications
      const notifs = JSON.parse(localStorage.getItem('db_notifications') || '[]');
      const newNotif = {
        id: `n-sim-${Date.now()}`,
        text: notificationText,
        read: false,
        createdAt: new Date().toISOString()
      };
      notifs.unshift(newNotif);
      localStorage.setItem('db_notifications', JSON.stringify(notifs));
      
      setNotifications(notifs);
      setLatestNotification(newNotif);

      // Dispatch event so TaskContext can refresh
      window.dispatchEvent(new Event('db-update'));

    }, 30000); // Trigger every 30s
  };

  const markRead = async (id) => {
    const updated = await taskService.markNotificationRead(id);
    setNotifications(updated);
  };

  const clearAll = async () => {
    const cleared = await taskService.clearNotifications();
    setNotifications(cleared);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        notifications,
        latestNotification,
        markRead,
        clearAll
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
