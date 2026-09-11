const Chunk = require("../models/Chunk");

const searchKeywordChunks = async (
  query,
  userId,
  documentId
) => {

  const results = await Chunk.find(
  {
    $text: {
      $search: query
    },
    userId,
    documentId
  },
  {
    _id: 1,
    text: 1,
    chunkIndex: 1,
    pageNumber: 1,
    documentId: 1,
    userId: 1,
    score: {
      $meta: "textScore"
    }
  }
)
  .sort({
    score: {
      $meta: "textScore"
    }
  })
  .limit(10)
  .lean();

  return results;
};

module.exports = {
  searchKeywordChunks
};