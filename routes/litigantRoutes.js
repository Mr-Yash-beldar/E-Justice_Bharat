
const express = require('express');
const router = express.Router();
const { signup, completeProfile, authenticate,  getLitigant } = require('../controllers/litigantController');
const { validateSignup, validateProfile } = require('../middlewares/validationMiddleware');
const authenticateJWT = require('../middlewares/authmiddleware');
const  uploadFields  = require('../middlewares/uploadMiddleware');


// Signup route
router.post('/signup', validateSignup, signup);

// Complete profile route
router.post("/completeProfile", authenticateJWT,validateProfile, uploadFields, completeProfile); // Assuming user is authenticated

// Authentication route
router.post('/authenticate', authenticate);

// Get all litigants route
// router.get('/litigants', authenticateJWT, getLitigants); // Assuming authentication required

// Get specific litigant route
router.get('/getDetails/', authenticateJWT, getLitigant); // Either ID or email is required

module.exports = router;
