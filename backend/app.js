import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// Set security headers
app.use(helmet());

// Enable CORS
app.use(cors({
  origin: '*', // Allow all origins for local testing, can be locked to frontend URL (http://localhost:5173) in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Express Rate Limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 1500, // Limit each IP to 1500 requests per 10 mins
  message: {
    success: false,
    error: 'Too many requests from this IP address, please retry after 10 minutes',
  },
});
app.use('/api', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome / Status endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TaskFlow API Service is active',
    version: '1.0.0',
  });
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
