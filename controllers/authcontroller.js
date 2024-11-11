// controllers/authController.js
exports.verifyToken = (req, res) => {
    // The middleware would have already validated the token, so if we're here, it's valid
    res.json({ valid: true, user: req.user });
};