const jwt = require("jsonwebtoken")
const User = require("../models/user")
const redisClient = require("../config/redis");


const adminValidation = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) throw new Error("Token is not present");
        const payload = jwt.verify(token, process.env.JWT_KEY);

        const { userId } = payload;
        if (!userId) throw new Error("Invalid token");
        if(payload.role!="admin") throw new Error("Not an Admin");

        const user = await User.findById(userId);
        if (!user) throw new Error("User doesn't Exist");
    
        //check ki token redis ke blocklist me to nhi h
        const IsBlocked = await redisClient.exists(`token:${token}`);

        if (IsBlocked) throw new Error("Invalid Token");

        req.result = user;

        next();
    }
    catch (err) {
        res.status(401).send(err.message);
    }

}

module.exports = adminValidation;