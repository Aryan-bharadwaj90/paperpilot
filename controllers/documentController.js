const Document = require("../models/Document");
const Chunk = require("../models/Chunk");

const {searchSimilarChunks} = require("../services/vectorSearchService");
const {answerQuestion,streamAnswerQuestion} = require("../services/ragService");

const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const documentQueue = require("../queues/documentQueue");

const fs = require("fs");

const {
  uploadFileToS3,deleteFileFromS3
} = require("../services/s3Service");

const createDocument = async (req, res) => {
  let s3Key=null;
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "PDF file is required"
      });
    }

    s3Key =`documents/${req.user._id}/${Date.now()}-${req.file.originalname}`;

    await uploadFileToS3(
      req.file.path,
      s3Key,
      req.file.mimetype
    );

    const document =
      await Document.create({
        userId: req.user._id,
        fileName: req.file.originalname,
        fileUrl: s3Key,
        status: "processing"
      });

    console.log(
      "Document created:",
      document._id
    );

    const job =
      await documentQueue.add(
        "process-document",
        {
          documentId:
            document._id.toString(),

          userId:
            req.user._id.toString(),

          s3Key
        }
      );

    console.log(
      "Document processing job added:",
      job.id
    );

    fs.unlink(
      req.file.path,
      (error) => {
        if (error) {
          console.error(
            "Failed to delete temporary file:",
            error.message
          );
        }
      }
    );

    return res.status(202).json({
      message:
        "Document uploaded and processing started",

      document,

      jobId: job.id
    });

  } catch (error) {

    console.error(
      "Create document error:",
      error
    );
    if (s3Key) {
    try {
      await deleteFileFromS3(s3Key);

      console.log(
        "Cleaned up S3 object after upload failure:",
        s3Key
      );

    } catch (cleanupError) {

      console.error(
        "S3 cleanup failed:",
        cleanupError.message
      );
    }
  }

  if (req.file) {
    fs.unlink(
      req.file.path,
      (cleanupError) => {

        if (cleanupError) {
          console.error(
            "Failed to delete temporary file:",
            cleanupError.message
          );
        }
      }
    );
  }

    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      userId: req.user._id
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      documents
    });
  } catch (error) {
    console.error("Get documents error:", error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};


const getDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found"
      });
    }

    return res.status(200).json({
      document
    });
  } catch (error) {
    console.error("Get document error:", error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};  

const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find document belonging to logged-in user
    const document = await Document.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found"
      });
    }
    // 2. Delete PDF from S3
    await deleteFileFromS3( document.fileUrl);

    // 2. Delete all chunks belonging to document
    await Chunk.deleteMany({
      documentId: document._id,
      userId: req.user._id
    });

    // 3. Find conversation for this document
    const conversation = await Conversation.findOne({
      documentId: document._id,
      userId: req.user._id
    });

    // 4. Delete messages belonging to conversation
    if (conversation) {
      await Message.deleteMany({
        conversationId: conversation._id
      });

      // 5. Delete conversation
      await Conversation.deleteOne({
        _id: conversation._id
      });
    }

    // 6. Delete document
    await Document.deleteOne({
      _id: document._id
    });

    return res.status(200).json({
      message: "Document and associated data deleted successfully"
    });

  } catch (error) {
    console.error(
      "Delete document error:",
      error
    );

    return res.status(500).json({
      message: "Server error"
    });
  }
};


const searchDocument = async (req, res) => {
  try {
    const { query } = req.body;//req.body.query
    const { id } = req.params;//URL:/documents/ABC123/search req.params.id

    const document = await Document.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found"
      });
    }
    if (!query) {
      return res.status(400).json({
        message: "Query is required"
      });
    }

    const results = await searchSimilarChunks(
      query,
      req.user._id,
      id
    );

    return res.status(200).json({
      query,
      results
    });

  } catch (error) {
    console.error("Search document error:", error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};


const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    const { id } = req.params;

    const document = await Document.findOne({
  _id: id,
  userId: req.user._id
});

if (!document) {
  return res.status(404).json({
    message: "Document not found"
  });
}
    if (!question) {
      return res.status(400).json({
        message: "Question is required"
      });
    }

    const result = await answerQuestion(
      question,
      req.user._id,
      id
    );

    return res.status(200).json(result);

  } catch (error) {
    console.error("Ask question error:", error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

const streamQuestion = async (req, res) => {

  try {

    const {id: documentId} = req.params;
    const {question} = req.body;
 
    // Verify that the document belongs to the logged-in user
    const document = await Document.findOne({
  _id: documentId,
  userId: req.user._id
});

if (!document) {
  return res.status(404).json({
    message: "Document not found"
  });
}
  
    // VALIDATE QUESTION

    if (!question || !question.trim()) {

      return res.status(400).json({
        message: "Question is required"
      });
    }
    
    // SSE HEADERS
    
    res.setHeader(
      "Content-Type",
      "text/event-stream"
    );

    res.setHeader(
      "Cache-Control",
      "no-cache"
    );

    res.setHeader(
      "Connection",
      "keep-alive"
    );

    res.flushHeaders();

    // SEND TOKEN

    const sendToken = (token) => {

      res.write(
        `data: ${JSON.stringify({
          type: "token",
          token
        })}\n\n`
      );
    };

    // SEND COMPLETE

    const sendComplete = (result) => {

      res.write(
        `data: ${JSON.stringify({
          type: "complete",
          ...result
        })}\n\n`
      );

      res.end();
    };

    // RUN STREAMING RAG
    
    
    await streamAnswerQuestion(
      question,
      req.user._id,
      documentId,
      sendToken,
      sendComplete
    );

  } catch (error) {

    console.error(
      "Streaming question error:",
      error.message
    );

    if (!res.headersSent) {

      return res.status(500).json({
        message: "Streaming failed",
        error: error.message
      });
    }


    res.write(
      `data: ${JSON.stringify({
        type: "error",
        message: error.message
      })}\n\n`
    );

    res.end();
  }
};
module.exports = {
  createDocument,getDocuments,getDocument,deleteDocument,searchDocument,askQuestion,streamQuestion
  
};