//  const generateEmbedding = async (text) => {//why asnc? because we are making a network request , we dont want node to block while waiting
//   const response = await fetch("http://localhost:11434/api/embed", {//making an http request to ollma
//     method: "POST",

//     headers: {
//       "Content-Type": "application/json"
//     },

//     body: JSON.stringify({
//       model: "nomic-embed-text",
//       input: text
//     })
//   });

//   if (!response.ok) {
//     throw new Error("Failed to generate embedding");
//   }

//   const data = await response.json();//The HTTP response comes back as JSON,soconvert it into a JavaScript object:

//   return data.embeddings[0];//extracts the actual vector 
// };

// module.exports = {
//   generateEmbedding
// };
// //take text and return it vector representation 



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