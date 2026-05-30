import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import app from './app.js';
import connectDB from './config/db.js';
import { socketHandler } from './sockets/socketHandler.js';
import { setIO } from './services/socketService.js';
import { seedDatabase } from './utils/seed.js';

// Load environmental variables
dotenv.config();

// Connect to MongoDB
connectDB()
  .then(() => {
    // Seed initial dataset if database is empty
    return seedDatabase();
  })
  .catch((err) => {
    console.error('Failed to establish initial environment: ', err.message);
  });

// Create HTTP Server
const server = http.createServer(app);

// Bind Socket.IO Server
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all client connections during development
    methods: ['GET', 'POST'],
  },
});

// Store socket reference globally inside services
setIO(io);

// Initialize Socket event logic
socketHandler(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
