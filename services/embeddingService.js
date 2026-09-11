const generateEmbedding = async (text) => {
  const response = await fetch(
    "http://localhost:11434/api/embed",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        model: "nomic-embed-text",
        input: text
      })
    }
  );

  if (!response.ok) {
    throw new Error("Failed to generate embedding");
  }

  const data = await response.json();

  if (
    !data.embeddings ||
    !data.embeddings[0]
  ) {
    throw new Error("Invalid embedding response from Ollama");
  }

  return data.embeddings[0];
};

module.exports = {
  generateEmbedding
};