// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontroller');
const authenticateLitigant = require('../middlewares/authMiddleware');

// Route to verify token
router.get('/verifyLitigant-token', authenticateLitigant, authController.verifyLitigantToken);

module.exports = router;
