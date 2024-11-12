
const express = require('express');
const router = express.Router();
const { signup, completeProfile, authenticate,  getLitigant, getAllAdvocateByLitigant } = require('../controllers/litigantController');
const { validateSignup, validateProfile } = require('../middlewares/validationMiddleware');
const verifyAuthToken = require('../middlewares/authMiddleware');


// Signup route
router.post('/signup', validateSignup, signup);

// Authentication route
router.post('/authenticate', authenticate);

// Complete profile route
router.post("/completeProfile", verifyAuthToken,validateProfile, completeProfile); // Assuming user is authenticated

// Get all litigants route
// router.get('/litigants', verifyAuthToken, getLitigants); // Assuming authentication required

// Get specific litigant route
router.get('/getDetails', verifyAuthToken, getLitigant); // Either ID or email is required

// Get All Advocate by Litigant
router.get('/getAdvocates', verifyAuthToken, getAllAdvocateByLitigant); // Either ID or email is required

module.exports = router;
