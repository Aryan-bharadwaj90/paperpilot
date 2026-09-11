const crypto = require("crypto");

const generateQuestionHash = (question) => {
  return crypto
    .createHash("sha256")
    .update(question.trim().toLowerCase())
    .digest("hex");
};

const generateRagCacheKey = (userId,documentId,question) => {
  const questionHash =
    generateQuestionHash(question);

  return `rag:${userId}:${documentId}:${questionHash}`;
};

module.exports = {
  generateRagCacheKey
};