const { body, param } = require('express-validator');

// Poll creation validation
exports.createPollValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),

  body('timezone')
    .optional()
    .isString().withMessage('Timezone must be a string'),

  body('time_slots')
    .isArray({ min: 1 }).withMessage('At least one time slot is required'),

  body('time_slots.*.start_time')
    .notEmpty().withMessage('Start time is required')
    .isISO8601().withMessage('Start time must be a valid ISO 8601 date'),

  body('time_slots.*.end_time')
    .notEmpty().withMessage('End time is required')
    .isISO8601().withMessage('End time must be a valid ISO 8601 date')
];

// Response creation validation
exports.createResponseValidation = [
  param('poll_code')
    .notEmpty().withMessage('Poll code is required')
    .isLength({ min: 3, max: 20 }).withMessage('Invalid poll code'),

  body('participant_name')
    .trim()
    .notEmpty().withMessage('Participant name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

  body('participant_email')
    .optional()
    .trim()
    .isEmail().withMessage('Invalid email address'),

  body('availability')
    .isArray({ min: 1 }).withMessage('At least one availability entry is required'),

  body('availability.*.time_slot_id')
    .isInt({ min: 1 }).withMessage('Invalid time slot ID'),

  body('availability.*.status')
    .isIn(['available', 'if_needed', 'not_available']).withMessage('Invalid availability status')
];

// Update response validation
exports.updateResponseValidation = [
  param('code')
    .notEmpty().withMessage('Response code is required'),

  body('participant_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

  body('participant_email')
    .optional()
    .trim()
    .isEmail().withMessage('Invalid email address'),

  body('availability')
    .optional()
    .isArray().withMessage('Availability must be an array'),

  body('availability.*.time_slot_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid time slot ID'),

  body('availability.*.status')
    .optional()
    .isIn(['available', 'if_needed', 'not_available']).withMessage('Invalid availability status')
];
