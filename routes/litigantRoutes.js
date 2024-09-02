
const express = require('express');
const router = express.Router();
const { signup, completeProfile, authenticate, getLitigants, getLitigant } = require('../controllers/litigantController');
const { validateSignup, validateProfile } = require('../middlewares/validationMiddleware');
const authenticateJWT = require('../middlewares/authmiddleware');

// Signup route
router.post('/signup', validateSignup, signup);

// Complete profile route
router.put('/profile', authenticateJWT, validateProfile, completeProfile); // Assuming user is authenticated

// Authentication route
router.post('/authenticate', authenticate);

// Get all litigants route
router.get('/litigants', authenticateJWT, getLitigants); // Assuming authentication required

// Get specific litigant route
router.get('/litigant/:id?', authenticateJWT, getLitigant); // Either ID or email is required

module.exports = router;
