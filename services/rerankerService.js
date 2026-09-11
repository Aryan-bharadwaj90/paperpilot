const rerankChunks = async (query, chunks) => {
  if (!chunks || chunks.length === 0) {
    return [];
  }

  const startTime = Date.now();

  const response = await fetch(
    "http://127.0.0.1:8000/rerank",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query,
        documents: chunks.map(
          (chunk) => chunk.text
        )
      })
    }
  );

  if (!response.ok) {
    throw new Error(
      "Reranker service failed"
    );
  }

  const data = await response.json();

  const rerankedChunks = data.results.map(
    (result) => ({
      ...chunks[result.index],
      rerankScore: result.score
    })
  );

  rerankedChunks.sort(
    (a, b) =>
      b.rerankScore - a.rerankScore
  );

  const rerankerTime =
    Date.now() - startTime;

  console.log(
    "Reranker time:",
    rerankerTime,
    "ms"
  );

  return rerankedChunks;
};

module.exports = {
  rerankChunks
};