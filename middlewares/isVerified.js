const Litigant = require('../models/litigant');

const isVerified = async (req, res, next) => {
    try {
        const userId = req.user.id; // Assuming the user ID is stored in req.user by a previous middleware (e.g., JWT auth middleware)

        // Find the user by ID
        const user = await Litigant.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if the user is verified
        if (!user.isVerified) {
            return res.status(403).json({ message: 'Email not verified. Please verify your email before accessing this resource.' });
        }

        // If verified, proceed to the next middleware or route handler
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = isVerified;
