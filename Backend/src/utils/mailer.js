const nodemailer = require("nodemailer");

// Configure SMTP transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true", // true for port 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    family: 4 // Force IPv4 to prevent IPv6 network connection issues on Render
});

/**
 * Send OTP Verification Email
 * @param {string} email 
 * @param {string} otp 
 */
const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: `"CodeArena" <${process.env.EMAIL_USER || "noreply@codearena.com"}>`,
        to: email,
        subject: "Verify Your CodeArena Account - OTP",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; background-color: #fcfcfc;">
                <h2 style="color: #1e3a8a; text-align: center;">Welcome to CodeArena!</h2>
                <p>Hello,</p>
                <p>Thank you for signing up on CodeArena. To complete your registration, please verify your email address using the One-Time Password (OTP) below:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e40af; background-color: #eff6ff; padding: 10px 20px; border-radius: 5px; border: 1px dashed #3b82f6;">
                        ${otp}
                    </span>
                </div>
                <p style="color: #ef4444; font-weight: bold;">Note: This OTP is valid for 5 minutes and can only be verified up to 3 times.</p>
                <p>If you did not request this code, you can safely ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin-top: 30px;" />
                <p style="font-size: 12px; color: #6b7280; text-align: center;">This is an automated email. Please do not reply directly to this mail.</p>
            </div>
        `
    };

    // If SMTP auth is not configured, fallback to console log
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log("========================================");
        console.log(`[MAIL MOCK] Sending OTP to: ${email}`);
        console.log(`[MAIL MOCK] OTP Code: ${otp}`);
        console.log("========================================");
        return { message: "Mock email sent (check server logs for OTP)" };
    }

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        // Fallback so it doesn't crash signup if mail fails during development
        console.log("========================================");
        console.log(`[MAIL FALLBACK] Failed to send email via SMTP. Details:`);
        console.log(`To: ${email}`);
        console.log(`OTP Code: ${otp}`);
        console.log("========================================");
        return { error: true, message: error.message };
    }
};

module.exports = { sendOTPEmail };
