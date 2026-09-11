const {
  searchSimilarChunks
} = require("./vectorSearchService");

const {
  searchKeywordChunks
} = require("./keywordSearchService");


const hybridSearch = async (
  query,
  userId,
  documentId
) => {

  const [
    vectorResults,
    keywordResults
  ] = await Promise.all([//runs both searches in parallel.
    searchSimilarChunks(
      query,
      userId,
      documentId
    ),

    searchKeywordChunks(
      query,
      userId,
      documentId
    )
  ]);


  const resultsMap = new Map();

  const k = 60;


  vectorResults.forEach((chunk, index) => {

    const id = chunk._id.toString();

    const rank = index + 1;

    const score = 1 / (k + rank);

    resultsMap.set(id, {
      ...chunk,
      hybridScore: score
    });

  });


  keywordResults.forEach((chunk, index) => {

    const id = chunk._id.toString();

    const rank = index + 1;

    const score = 1 / (k + rank);


    if (resultsMap.has(id)) {

      const existing =
        resultsMap.get(id);

      existing.hybridScore += score;

    } else {

      resultsMap.set(id, {
        ...chunk,
        hybridScore: score
      });

    }

  });


  const results = Array.from(
    resultsMap.values()
  )
    .sort(
      (a, b) =>
        b.hybridScore - a.hybridScore
    )
    .slice(0, 10);


  console.log(
    "Vector results:",
    vectorResults.length
  );

  console.log(
    "Keyword results:",
    keywordResults.length
  );

  console.log(
    "Hybrid results:",
    results.length
  );


  return results;
};


module.exports = {
  hybridSearch
};