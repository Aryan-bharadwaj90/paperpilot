const generateAnswer = async (prompt) => {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      model: "qwen2.5:7b",
      prompt,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error("Failed to generate answer");
  }

  const data = await response.json();

  return data.response;
};

module.exports = {
  generateAnswer
};

const generateAnswerStream = async (
  prompt,
  onToken
) => {

  const response = await fetch(
    "http://localhost:11434/api/generate",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        model: "qwen2.5:7b",
        prompt,
        stream: true
      })
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to generate streaming answer"
    );
  }

  const reader =
    response.body.getReader();

  const decoder =
    new TextDecoder();

  let buffer = "";

  while (true) {

    const { value, done } =
      await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(
      value,
      { stream: true }
    );

    const lines =
      buffer.split("\n");

    buffer =
      lines.pop();

    for (const line of lines) {

      if (!line.trim()) {
        continue;
      }

      try {

        const data =
          JSON.parse(line);

        if (data.response) {

          onToken(data.response);
        }

      } catch (error) {

        console.error(
          "Failed to parse Ollama stream:",
          error.message
        );
      }
    }
  }
};


module.exports = {
  generateAnswer,generateAnswerStream
};