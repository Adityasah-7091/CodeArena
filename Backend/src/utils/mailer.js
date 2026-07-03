const axios = require("axios");

/**
 * Send OTP Verification Email using Resend HTTP Mail API
 * @param {string} email 
 * @param {string} otp 
 */
const sendOTPEmail = async (email, otp) => {
    const htmlContent = `
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
    `;

    const apiKey = process.env.RESEND_API_KEY;

    // If Resend API Key is not configured, fallback to console log
    if (!apiKey) {
        console.log("========================================");
        console.log(`[MAIL MOCK] Resend API key is missing. Logging OTP.`);
        console.log(`[MAIL MOCK] Sending OTP to: ${email}`);
        console.log(`[MAIL MOCK] OTP Code: ${otp}`);
        console.log("========================================");
        return { message: "Mock email logged (RESEND_API_KEY is not defined)" };
    }

    try {
        const response = await axios.post(
            "https://api.resend.com/emails",
            {
                from: "onboarding@resend.dev", // Free sandbox sender
                to: email,
                subject: "Verify Your CodeArena Account - OTP",
                html: htmlContent
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log(`Email sent successfully via Resend API: ${response.data.id}`);
        return response.data;
    } catch (error) {
        const errMsg = error.response?.data?.message || error.message;
        console.error("Error sending email via Resend:", errMsg);
        
        // Fallback so it doesn't crash signup if API fails
        console.log("========================================");
        console.log(`[MAIL FALLBACK] Failed to send email via Resend API. Details:`);
        console.log(`To: ${email}`);
        console.log(`OTP Code: ${otp}`);
        console.log("========================================");
        return { error: true, message: errMsg };
    }
};

module.exports = { sendOTPEmail };
