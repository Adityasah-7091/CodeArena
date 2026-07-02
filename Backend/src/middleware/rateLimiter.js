const redisClient = require("../config/redis");

const codeExecutionLimiter = async (req, res, next) => {
    try {
        if (!req.result || !req.result._id) {
            return res.status(401).send("Unauthorized");
        }

        const userId = req.result._id.toString();
        const limit = 5; // Maximum of 5 code runs/submissions
        const windowSizeInSeconds = 30; // Per 30 seconds window

        const key = `ratelimit:${userId}:code`;
        const requests = await redisClient.incr(key);

        if (requests === 1) {
            await redisClient.expire(key, windowSizeInSeconds);
        }

        if (requests > limit) {
            const ttl = await redisClient.ttl(key);
            const waitTime = ttl > 0 ? ttl : windowSizeInSeconds;
            return res.status(429).send(`Too many requests. Please wait ${waitTime} seconds before running/submitting code again.`);
        }

        next();
    } catch (err) {
        console.error("Rate limit middleware error:", err);
        next(); // Fallback: allow request to proceed if Redis fails
    }
};

module.exports = codeExecutionLimiter;
