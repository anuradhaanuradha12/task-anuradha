import { body, validationResult } from 'express-validator';

// Check for validation errors utility
export const validateFields = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

export const registerValidator = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  
  body('email')
    .isEmail()
    .withMessage('Please include a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be 6 or more characters'),
  
  body('role')
    .optional()
    .isIn(['Admin', 'Manager', 'Employee'])
    .withMessage('Role must be Admin, Manager, or Employee'),
    
  body('avatar')
    .optional()
    .trim(),

  validateFields,
];

export const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Please include a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  validateFields,
];
