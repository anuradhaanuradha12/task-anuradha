import express from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  patchStatus,
  addComment,
  getActivities,
} from '../controllers/taskController.js';
import {
  createTaskValidator,
  updateTaskValidator,
  statusValidator,
  commentValidator,
} from '../validators/taskValidator.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Static routes first to prevent :id wildcard collision
router.get('/activities', protect, getActivities);

// Core CRUD routes
router.route('/')
  .get(protect, getTasks)
  .post(protect, createTaskValidator, createTask);

router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, updateTaskValidator, updateTask)
  .delete(protect, deleteTask);

// Status and comments subroutes
router.patch('/:id/status', protect, statusValidator, patchStatus);
router.post('/:id/comments', protect, commentValidator, addComment);

export default router;
