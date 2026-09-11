const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(
      null,
      `${Date.now()}-${file.originalname}`
    );
  }
});

const fileFilter = (req,file,cb) => {

  if (file.mimetype !== "application/pdf") {//PDF validation MIME type validation is useful, but it's not cryptographic proof that the file is really a PDF. Someone can spoof MIME metadata.

//For a student project, this is a good first layer. Later, if we want stronger validation, we can inspect the PDF signature (%PDF) before processing
    return cb(
      new Error("Only PDF files are allowed")
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024//10 MB size limit
  },

  fileFilter
});

module.exports = upload;