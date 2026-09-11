const mongoose = require("mongoose");
const Chunk = require("../models/Chunk");
const {
  generateEmbedding
} = require("./embeddingService");

const searchSimilarChunks = async (query,userId,documentId) => {
  // Convert user's question into embedding
  const embeddingStart = Date.now();
  const queryEmbedding =await generateEmbedding(query);

  const embeddingTime =Date.now() - embeddingStart;
  console.log("Query embedding time:",embeddingTime, "ms");

  console.log("Query embedding length:",queryEmbedding.length);

  console.log("Searching document:",documentId);

  const searchStart = Date.now();
  const results = await Chunk.aggregate([
    {
      $vectorSearch: {
        index: "vector_index",

        path: "embedding",

        queryVector: queryEmbedding,

        numCandidates: 100,

        limit: 10,

        filter: {
          userId: {
            $eq: new mongoose.Types.ObjectId(
              userId
            )
          },

          documentId: {
            $eq: new mongoose.Types.ObjectId(
              documentId
            )
          }
        }
      }
    },

    {
      $project: {
        _id: 1,

        text: 1,

        chunkIndex: 1,

        pageNumber: 1,

        documentId: 1,

        userId: 1,

        score: {
          $meta: "vectorSearchScore"
        }
      }
    }
  ]);

  const searchTime = Date.now() - searchStart;

  console.log("Vector search time:",searchTime,"ms");
  console.log("Vector search results:",results.length);

  return results;
};

module.exports = { searchSimilarChunks };