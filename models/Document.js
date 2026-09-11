const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    fileName: {
      type: String,
      required: true,
      trim: true
    },

    fileUrl: {
      type: String
    },

    status: {
      type: String,
      enum: ["processing", "ready", "failed"],
      default: "processing"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Document", documentSchema);