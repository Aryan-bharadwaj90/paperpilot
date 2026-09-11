const redisConnection = require("../config/redis");

const getCache = async (key) => {
  return await redisConnection.get(key);
};

const setCache = async (key, value, ttl = 300) => {
  await redisConnection.set(
    key,
    value,
    "EX",
    ttl//EX 300 means:Keep this value for 300 seconds.
  );
};  

const deleteCache = async (key) => {
  await redisConnection.del(key);
};

module.exports = {
  getCache,
  setCache,
  deleteCache
};

//userId + documentId + question
//Even if they ask exactly the same question, their cached answers are separate.
//This is an important interview point.