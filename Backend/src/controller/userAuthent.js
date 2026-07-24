const validate = require('../utils/validate');
const User = require('../models/user');
const Submission = require('../models/submissionSchema')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");
const { sendOTPEmail } = require("../utils/mailer");


//register (starts OTP verification flow)
const register = async (req, res) => {
    try {
        const { firstName, lastName, emailId, password } = req.body;
        validate(req.body);

        const normalizedEmail = emailId.toLowerCase().trim();

        // Check if user already exists
        const existingUser = await User.findOne({ emailId: normalizedEmail });
        if (existingUser) {
            return res.status(400).send("Error : Email already registered");
        }

        // Generate 6-digit OTP using Math.random
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store signup details in Redis (expires in 5 minutes)
        await redisClient.set(`signup:${normalizedEmail}`, JSON.stringify({ firstName, lastName, emailId: normalizedEmail, password }), { EX: 300 });

        // Store OTP in Redis (expires in 5 minutes)
        await redisClient.set(`otp:${normalizedEmail}`, otp, { EX: 300 });

        // Store attempt counter in Redis (expires in 5 minutes)
        await redisClient.set(`attempts:${normalizedEmail}`, "0", { EX: 300 });

        // Send the OTP
        await sendOTPEmail(normalizedEmail, otp);

        res.status(200).send("OTP sent successfully to your email");
    }
    catch (err) {
        res.status(400).send("Error : " + err.message);
    }
}

// verify OTP
const verifyOtp = async (req, res) => {
    try {
        const { emailId, otp } = req.body;
        if (!emailId || !otp) {
            return res.status(400).send("Error: Email and OTP are required");
        }

        const normalizedEmail = emailId.toLowerCase().trim();

        // Check attempts first
        const attemptsStr = await redisClient.get(`attempts:${normalizedEmail}`);
        if (attemptsStr === null) {
            return res.status(400).send("Error: OTP has expired or session does not exist. Please sign up again.");
        }

        let attempts = parseInt(attemptsStr) + 1;
        await redisClient.set(`attempts:${normalizedEmail}`, attempts.toString(), { EX: 300 });

        if (attempts > 3) {
            await redisClient.del(`signup:${normalizedEmail}`);
            await redisClient.del(`otp:${normalizedEmail}`);
            await redisClient.del(`attempts:${normalizedEmail}`);
            return res.status(400).send("Error: Too many incorrect verification attempts. Please sign up again.");
        }

        const storedOtp = await redisClient.get(`otp:${normalizedEmail}`);
        if (!storedOtp) {
            return res.status(400).send("Error: OTP has expired. Please sign up again.");
        }

        if (storedOtp !== otp) {
            const remaining = 3 - attempts;
            return res.status(400).send(`Error: Invalid OTP. ${remaining} attempts remaining.`);
        }

        // OTP is correct! Get registration data
        const signupDataStr = await redisClient.get(`signup:${normalizedEmail}`);
        if (!signupDataStr) {
            return res.status(400).send("Error: Registration session expired. Please sign up again.");
        }

        const signupData = JSON.parse(signupDataStr);
        const { firstName, lastName, password } = signupData;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            firstName,
            lastName,
            emailId: normalizedEmail,
            password: hashedPassword,
            role: "user"
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, emailId: normalizedEmail, role: "user" },
            process.env.JWT_KEY,
            { expiresIn: 60 * 60 }
        );

        // Clear Redis keys
        await redisClient.del(`signup:${normalizedEmail}`);
        await redisClient.del(`otp:${normalizedEmail}`);
        await redisClient.del(`attempts:${normalizedEmail}`);

        // Set JWT token cookie
        const isProduction = process.env.NODE_ENV === "production" || !!process.env.FRONTEND_URL;
        res.cookie('token', token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax'
        });
        res.status(201).json({
            message: "User verified and registered successfully",
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                emailId: user.emailId,
                role: user.role,
                problemsolved: user.problemsolved
            },
            token
        });
    }
    catch (err) {
        res.status(400).send("Error: " + err.message);
    }
}

// resend OTP
const resendOtp = async (req, res) => {
    try {
        const { emailId } = req.body;
        if (!emailId) {
            return res.status(400).send("Error: Email is required");
        }

        const normalizedEmail = emailId.toLowerCase().trim();

        // Check if registration data exists
        const signupDataStr = await redisClient.get(`signup:${normalizedEmail}`);
        if (!signupDataStr) {
            return res.status(400).send("Error: Signup session expired or does not exist. Please sign up again.");
        }

        // Check cooldown
        const hasCooldown = await redisClient.exists(`cooldown:${normalizedEmail}`);
        if (hasCooldown) {
            return res.status(429).send("Error: Please wait 60 seconds before requesting a new OTP.");
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Update OTP in Redis
        await redisClient.set(`otp:${normalizedEmail}`, otp, { EX: 300 });

        // Reset attempts
        await redisClient.set(`attempts:${normalizedEmail}`, "0", { EX: 300 });

        // Set cooldown
        await redisClient.set(`cooldown:${normalizedEmail}`, "true", { EX: 60 });

        // Send OTP
        await sendOTPEmail(normalizedEmail, otp);

        res.status(200).send("OTP resent successfully");
    }
    catch (err) {
        res.status(400).send("Error: " + err.message);
    }
}


//login
const login = async (req, res) => {
    try {
        const { emailId, password } = req.body;

        if (!emailId) throw new Error("credential missing");
        if (!password) throw new Error("credential missing");

        const user = await User.findOne({ emailId: emailId });
        if (!user) throw new Error("Invalid email or password");

        const result = await bcrypt.compare(password, user.password);

        if (!result) throw new Error("Invalid email or password");

        const token = jwt.sign({ userId: user._id, emailId: emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: 60 * 60 });
        const isProduction = process.env.NODE_ENV === "production" || !!process.env.FRONTEND_URL;
        res.cookie('token', token, {
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax'
        });
        res.status(201).send("User LogedIn successfully");
    }
    catch (err) {
        res.status(400).send("Error: " + err)
    }
}

// logout
const logout = async (req, res) => {
    try {
        //validate token using middleware

        //after validation add to redis
        const { token } = req.cookies;
        const payload = jwt.decode(token);
        await redisClient.set(`token:${token}`, "blocked")
        await redisClient.expireAt(`token:${token}`, payload.exp);

        //clear cookie
        const isProduction = process.env.NODE_ENV === "production" || !!process.env.FRONTEND_URL;
        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax'
        });
        res.send("Logged Out Succesfully");
    }
    catch (err) {
        res.status(503).send("Error: " + err.message);
    }
}

// getprofile
const getProfile = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) throw new Error("Token doesn't exist");

        const payload = jwt.verify(token, process.env.JWT_KEY);
        const { userId, emailId } = payload;
        if (!emailId) throw new Error("EmailId is missing");

        const result = await User.findById(userId);
        res.send(result);
    }
    catch (err) {
        res.status(400).send("Error: " + err)
    }
}

// Admin register
const adminReg = async (req, res) => {
    try {
        const { firstName, emailId, password } = req.body;
        validate(req.body);
        
        const normalizedEmail = emailId.toLowerCase().trim();
        const existingUser = await User.findOne({ emailId: normalizedEmail });
        if (existingUser) {
            return res.status(400).send("Error : Email already registered");
        }

        req.body.emailId = normalizedEmail;
        req.body.password = await bcrypt.hash(password, 10);
        await User.create(req.body);
        res.status(201).send("User registered successfully");
    }
    catch (err) {
        res.status(400).send("Error : " + err.message);
    }
}

//delete profilr
const deleteUser = async(req,res) =>{
    try {
        //validate token using middleware

        //after validation add to redis
        const { token } = req.cookies;
        const payload = jwt.decode(token);
        await redisClient.set(`token:${token}`, "blocked")
        await redisClient.expireAt(`token:${token}`, payload.exp);

        //clear cookie
        res.cookie("token", null, { expires: new Date(Date.now()) });

        //delete from user schema
        await User.findByIdAndDelete(payload.userId);

        //also delete from submission
        await Submission.deleteMany({user_id : payload.userId})
        res.send("Account deleted Succesfully");
    }
    catch (err) {
        res.status(503).send("Error: " + err.message);
    }
}

module.exports = { register, verifyOtp, resendOtp, login, logout, getProfile, adminReg, deleteUser};