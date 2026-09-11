const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true
    },

    title: {
      type: String,
      default: "New Conversation",
      trim: true
    }
  },
  {
    timestamps: true
  }
);

conversationSchema.index(
  { 
    userId: 1, 
    documentId: 1 
  },
  { 
    unique: true
  }
);

module.exports = mongoose.model("Conversation",conversationSchema);