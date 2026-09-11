const mongoose = require("mongoose");

const chunkSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    text: {
      type: String,
      required: true
    },

    chunkIndex: {
      type: Number,
      required: true
    },

    pageNumber: {
      type: Number,
      required: true
    },

    embedding: {
      type: [Number],
      required: true
    }
  },
  {
    timestamps: true
  }
);
chunkSchema.index({
  text: "text"
});

module.exports = mongoose.model("Chunk", chunkSchema);