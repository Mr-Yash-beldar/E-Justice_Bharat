const Litigant = require('../models/litigant');
const Advocate = require('../models/advocate');
const OTP = require('../models/otp');
const { generateOTP, sendVerificationEmail } = require('../utils/emailUtils'); 
const {  decrypt } = require('../utils/encryptionUtils'); // assuming your utils file is named encryptionUtils.js


const sendOtp = async (req, res) => {
    try {
        const { id } = req.query;
           
        // Decrypt the user ID
        const decryptedId = decrypt(id);

        // Find the user by decrypted ID
        const litigant = await Litigant.findById(decryptedId);

        if (!litigant) {
            return res.status(404).json({ error: 'User not found.' });
        }

        if (litigant.isVerified) {
            return res.status(400).json({ error: 'User is already verified.' });
        }

        // Generate OTP
        const otp = generateOTP();
        // console.log(otp);

        // Store the OTP in the database
        const newOtp = new OTP({
            userId: litigant._id,
            otp,
            expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes from now
        });

        await newOtp.save();

        // Send the OTP via email with the HTML template
        const message = "Email Verification";
        await sendVerificationEmail(litigant.litigant_email, otp, message);

        res.status(200).json({ message: 'OTP sent successfully. Please check your email.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const sendAdvocateOtp = async (req, res) => {
    try {
        const { id } = req.query;
           
        // Decrypt the user ID
        const decryptedId = decrypt(id);

        // Find the user by decrypted ID
        const advocate = await Advocate.findById(decryptedId);

        if (!advocate) {
            return res.status(404).json({ error: 'Advocate not found.' });
        }

        if (advocate.isVerified) {
            return res.status(400).json({ error: 'Advocate is already verified.' });
        }

        // Generate OTP
        const otp = generateOTP();
        console.log(otp);

        // Store the OTP in the database
        const newOtp = new OTP({
            userId: advocate._id,
            otp,
            expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes from now
        });

        await newOtp.save();

        // Send the OTP via email with the HTML template
        const message = "Email Verification";
        await sendVerificationEmail(advocate.email, otp, message);

        res.status(200).json({ message: 'OTP sent successfully. Please check your email.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { id, otp } = req.body;

        // Decrypt the user ID
        const decryptedId = decrypt(id);

        // Find the OTP entry
        const otpEntry = await OTP.findOne({ userId: decryptedId, otp });

        if (!otpEntry) {
            return res.status(402).json({ error: 'Invalid OTP.' });
        }

        if (Date.now() > otpEntry.expiresAt) {
            return res.status(405).json({ error: 'OTP has expired.' });
        }

        // Mark the user as verified
        await Litigant.findByIdAndUpdate(decryptedId, { isVerified: true });

        // Optionally, delete the OTP entry from the database
        await OTP.deleteOne({ _id: otpEntry._id });

        res.status(200).json({ message: 'Email verified successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const verifyAdvocateOtp = async (req, res) => {
    try {
        const { id, otp } = req.body;

        // Decrypt the user ID
        const decryptedId = decrypt(id);

        // Find the OTP entry
        const otpEntry = await OTP.findOne({ userId: decryptedId, otp });

        if (!otpEntry) {
            return res.status(402).json({ error: 'Invalid OTP.' });
        }

        if (Date.now() > otpEntry.expiresAt) {
            return res.status(405).json({ error: 'OTP has expired.' });
        }

        // Mark the user as verified
        await Advocate.findByIdAndUpdate(decryptedId, { isVerified: true });

        // Optionally, delete the OTP entry from the database
        await OTP.deleteOne({ _id: otpEntry._id });

        res.status(200).json({ message: 'Email verified successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { sendOtp, verifyOtp,sendAdvocateOtp,verifyAdvocateOtp };
