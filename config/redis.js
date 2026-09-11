const { Redis } = require("ioredis");

const redisConnection = new Redis(
  "redis://127.0.0.1:6379",
  {
    maxRetriesPerRequest: null
  }
);

redisConnection.on("connect", () => {
  console.log("Redis connected");
});

redisConnection.on("error", (error) => {
  console.error(
    "Redis connection error:",
    error.message
  );
});

module.exports = redisConnection;