const Litigant = require('../models/litigant');
const OTP = require('../models/OTP');
const { generateOTP, sendVerificationEmail } = require('../utils/emailUtils');
const crypto = require('crypto');

const sendOtp = async (req, res) => {
    try {
        const { litigant_email } = req.query;

        // Find the user by email
        const user = await Litigant.findOne({ litigant_email });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        if (user.isVerified) {
            return res.status(400).json({ error: 'User is already verified.' });
        }

        // Generate OTP and encrypted ID
        const otp = generateOTP();
        const encryptedId = crypto.createHash('sha256').update(user._id.toString()).digest('hex');

        // Store the OTP in the database
        const newOtp = new OTP({
            userId: user._id,
            otp,
            expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes from now
        });

        await newOtp.save();

        // Send the OTP via email with the HTML template
        const message = "Email Verification";
        await sendVerificationEmail(litigant_email, otp, message);

        res.status(200).json({ message: 'OTP sent successfully. Please check your email.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { sendOtp };
