
const express = require('express');
const router = express.Router();
const { signup, completeProfile, authenticate,  getLitigant } = require('../controllers/litigantController');
const { validateSignup, validateProfile } = require('../middlewares/validationMiddleware');
const authenticateLitigant = require('../middlewares/authMiddleware');
const  uploadFields  = require('../middlewares/uploadMiddleware');


// Signup route
router.post('/signup', validateSignup, signup);

// Authentication route
router.post('/authenticate', authenticate);

// Complete profile route
router.post("/completeProfile", authenticateLitigant,validateProfile, completeProfile); // Assuming user is authenticated

// Get all litigants route
// router.get('/litigants', authenticateLitigant, getLitigants); // Assuming authentication required

// Get specific litigant route
router.get('/getDetails/', authenticateLitigant, getLitigant); // Either ID or email is required

module.exports = router;
