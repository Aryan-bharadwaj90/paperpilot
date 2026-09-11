const redisConnection = require("../config/redis");

const rateLimit = (limit = 10, windowSeconds = 60) => {
  return async (req, res, next) => {
    try {
      const userId = req.user._id.toString();

      const key = `rate-limit:${userId}`;

      const currentCount =
        await redisConnection.incr(key);

      if (currentCount === 1) {
        await redisConnection.expire(
          key,
          windowSeconds
        );
      }

      if (currentCount > limit) {
        return res.status(429).json({
          message:
            "Too many requests. Please try again later."
        });
      }

      next();

    } catch (error) {
      console.error(
        "Rate limiter error:",
        error.message
      );

      next();
    }
  };
};

module.exports = rateLimit;