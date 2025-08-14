const { body, validationResult } = require('express-validator');

// Middleware to handle the result of any validation chain
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Validation rules for user registration
exports.validateRegistration = [
    body('displayName').notEmpty().withMessage('Display name is required.'),
    body('email').isEmail().withMessage('Please provide a valid email address.'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long.'),
    handleValidationErrors,
];

// Validation rules for user login
exports.validateLogin = [
    body('email').isEmail().withMessage('Please provide a valid email.'),
    body('password').notEmpty().withMessage('Password is required.'),
    handleValidationErrors,
];

// Validation rules for creating/updating an article
exports.validateArticle = [
    body('title.en').notEmpty().withMessage('English title is required.'),
    body('title.id').notEmpty().withMessage('Indonesian title is required.'),
    body('content.en').notEmpty().withMessage('English content is required.'),
    body('content.id').notEmpty().withMessage('Indonesian content is required.'),
    body('metaDescription.en').notEmpty().withMessage('English meta description is required.'),
    body('metaDescription.id').notEmpty().withMessage('Indonesian meta description is required.'),
    body('featuredImage.url')
        .custom((value) => {
            try {
                new URL(value);
                return true;
            } catch {
                throw new Error('A valid featured image URL is required.');
            }
        }),
    body('featuredImage.altText.en').notEmpty().withMessage('English image alt text is required.'),
    body('featuredImage.altText.id').notEmpty().withMessage('Indonesian image alt text is required.'),
    body('status').isIn(['draft', 'published']).withMessage('Invalid status.'),
    handleValidationErrors,
];