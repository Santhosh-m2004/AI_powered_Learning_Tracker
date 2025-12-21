import { body, query, param, validationResult } from 'express-validator';

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase, one lowercase, and one number'),
  
  handleValidation
];

export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  handleValidation
];

export const validateLearningSession = [
  body('subject')
    .trim()
    .notEmpty().withMessage('Subject is required')
    .isLength({ max: 100 }).withMessage('Subject must not exceed 100 characters'),
  
  body('topic')
    .trim()
    .notEmpty().withMessage('Topic is required')
    .isLength({ max: 200 }).withMessage('Topic must not exceed 200 characters'),
  
  body('timeSpent')
    .notEmpty().withMessage('Time spent is required')
    .isInt({ min: 1, max: 480 }).withMessage('Time must be between 1 and 480 minutes'),
  
  body('difficulty')
    .optional()
    .isIn(['easy', 'medium', 'hard']).withMessage('Difficulty must be easy, medium, or hard'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
  
  handleValidation
];

export const validateNote = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title must not exceed 200 characters'),
  
  body('content')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Content must not exceed 5000 characters'),
  
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
  
  body('subject')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Subject must not exceed 100 characters'),
  
  handleValidation
];

export const validatePlan = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title must not exceed 200 characters'),
  
  body('type')
    .notEmpty().withMessage('Type is required')
    .isIn(['daily', 'weekly', 'monthly']).withMessage('Type must be daily, weekly, or monthly'),
  
  body('tasks')
    .isArray().withMessage('Tasks must be an array')
    .notEmpty().withMessage('At least one task is required'),
  
  body('tasks.*.subject')
    .trim()
    .notEmpty().withMessage('Task subject is required'),
  
  body('tasks.*.topic')
    .trim()
    .notEmpty().withMessage('Task topic is required'),
  
  body('tasks.*.estimatedTime')
    .isInt({ min: 1, max: 480 }).withMessage('Estimated time must be between 1 and 480 minutes'),
  
  body('tasks.*.priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  
  handleValidation
];

export const validateIdParam = [
  param('id')
    .notEmpty().withMessage('ID is required')
    .isMongoId().withMessage('Invalid ID format'),
  
  handleValidation
];

export const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601().withMessage('Invalid start date format')
    .toDate(),
  
  query('endDate')
    .optional()
    .isISO8601().withMessage('Invalid end date format')
    .toDate(),
  
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365'),
  
  handleValidation
];