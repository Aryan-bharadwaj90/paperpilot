from flask import Flask, request, jsonify
from sentence_transformers import CrossEncoder

app = Flask(__name__)

print("Loading reranker model...")

model = CrossEncoder(
    "cross-encoder/ms-marco-MiniLM-L6-v2"
)

print("Reranker model loaded")


@app.route("/rerank", methods=["POST"])
def rerank():

    data = request.json

    query = data["query"]
    documents = data["documents"]

    pairs = [
        [query, document]
        for document in documents
    ]

    scores = model.predict(pairs)

    results = [
        {
            "index": i,
            "score": float(score)
        }
        for i, score in enumerate(scores)
    ]

    results.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return jsonify({
        "results": results
    })


if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=8000
    )