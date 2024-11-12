// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontroller');
const verifyAuthToken = require('../middlewares/authMiddleware');

// Route to verify token
router.get('/verify-token', verifyAuthToken, authController.verifyToken);

module.exports = router;
