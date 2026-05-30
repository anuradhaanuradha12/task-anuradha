import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Simple in-memory tracker of active socket sessions
// Maps socket.id -> { id: userId, name: userName, email, avatar, status: 'online' }
const activeConnections = new Map();

const getOnlineUsersList = () => {
  const users = {};
  for (const [socketId, user] of activeConnections.entries()) {
    users[user.id] = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      status: 'online',
    };
  }
  return Object.values(users);
};

export const socketHandler = (io) => {
  // Middleware to authenticate socket connections via JWT
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret_fallback_123456');
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      console.warn('Socket connection rejected: ', err.message);
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    
    // Add connection
    activeConnections.set(socket.id, {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    });

    console.log(`User connected: ${user.name} (Socket ID: ${socket.id})`);

    // Join a user-specific room for targeted notifications
    socket.join(`user:${user.id}`);

    // Broadcast updated online users list
    io.emit('online-users', getOnlineUsersList());

    // Listen for room join (e.g. workspace or specific task conversation rooms)
    socket.on('join-task', (taskId) => {
      socket.join(`task:${taskId}`);
      console.log(`${user.name} joined task room: ${taskId}`);
    });

    socket.on('leave-task', (taskId) => {
      socket.leave(`task:${taskId}`);
      console.log(`${user.name} left task room: ${taskId}`);
    });

    socket.on('disconnect', () => {
      activeConnections.delete(socket.id);
      console.log(`User disconnected: ${user.name} (Socket ID: ${socket.id})`);
      
      // Broadcast updated online users list
      io.emit('online-users', getOnlineUsersList());
    });
  });
};
