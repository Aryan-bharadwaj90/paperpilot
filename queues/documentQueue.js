const { Queue } = require("bullmq");
const redisConnection = require("../config/redis");

const documentQueue = new Queue(
  "document-processing",
  {
    connection: redisConnection,

    defaultJobOptions: {
      attempts: 3,//means the job gets up to 3 total attempts, not 3 retries after the initial attempt.

      backoff: {
        type: "exponential",
        delay: 5000
      },

      removeOnComplete: 100,//Means BullMQ keeps information about the most recent completed jobs, instead of Redis accumulating every completed job forever
      removeOnFail: 500//keeps failed-job information for debugging.
    }
  }
);

module.exports = documentQueue;