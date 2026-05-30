import { body } from 'express-validator';
import { validateFields } from './authValidator.js';

export const createTaskValidator = [
  body('title')
    .notEmpty()
    .withMessage('Task title is required')
    .trim(),
  
  body('description')
    .optional()
    .trim(),

  body('status')
    .optional()
    .isIn(['Pending', 'In Progress', 'Completed'])
    .withMessage('Status must be Pending, In Progress, or Completed'),

  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be Low, Medium, or High'),

  body('assignedTo')
    .optional()
    .isArray()
    .withMessage('AssignedTo must be an array of user IDs'),

  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date format (ISO8601)'),

  validateFields,
];

export const updateTaskValidator = [
  body('title')
    .optional()
    .notEmpty()
    .withMessage('Task title cannot be empty')
    .trim(),
  
  body('description')
    .optional()
    .trim(),

  body('status')
    .optional()
    .isIn(['Pending', 'In Progress', 'Completed'])
    .withMessage('Status must be Pending, In Progress, or Completed'),

  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be Low, Medium, or High'),

  body('assignedTo')
    .optional()
    .isArray()
    .withMessage('AssignedTo must be an array of user IDs'),

  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date format (ISO8601)'),

  validateFields,
];

export const statusValidator = [
  body('status')
    .notEmpty()
    .withMessage('Status value is required')
    .isIn(['Pending', 'In Progress', 'Completed'])
    .withMessage('Status must be Pending, In Progress, or Completed'),

  validateFields,
];

export const commentValidator = [
  body('text')
    .notEmpty()
    .withMessage('Comment text is required')
    .trim(),

  validateFields,
];
