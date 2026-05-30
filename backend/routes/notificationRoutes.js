import express from 'express';
import {
  getNotifications,
  markNotificationRead,
  clearNotifications,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getNotifications)
  .delete(protect, clearNotifications);

router.put('/:id/read', protect, markNotificationRead);

export default router;
