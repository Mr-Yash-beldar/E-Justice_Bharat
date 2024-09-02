const nodemailer = require('nodemailer');
const path = require('path');
const ejs = require('ejs');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendVerificationEmail = async (to, otp, subject) => {
    try {
        const templatePath = path.join(__dirname, '../templates/otpTemplate.ejs');
        const html = await ejs.renderFile(templatePath, { otp, subject });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html,
        };

        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error('Error sending email:', err);
    }
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

module.exports = { sendVerificationEmail, generateOTP };
