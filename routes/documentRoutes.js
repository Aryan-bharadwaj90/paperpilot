const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const {
  createDocument,getDocuments,getDocument,deleteDocument,searchDocument,
  askQuestion,benchmarkSearch,streamQuestion
} = require("../controllers/documentController");

const protect = require("../middleware/authMiddleware");
const documentQueue = require("../queues/documentQueue");
const rateLimit = require("../middleware/rateLimitMiddleware");
const router = express.Router();

router.post( "/",protect,(req, res, next) => {
    upload.single("file")(req,res,(error) => {
        if (error) {
          return res.status(400).json({
            message: error.message
          });
        }
        next();
      }
    );
  },
  createDocument
);
router.get("/",protect,getDocuments);
router.get("/:id", protect, getDocument);
router.delete("/:id", protect, deleteDocument);
router.post("/:id/search", protect, searchDocument);
router.post("/:id/ask", protect,rateLimit(10,60), askQuestion);
router.post("/:id/ask/stream",protect,rateLimit(10, 60),streamQuestion);

module.exports = router;
