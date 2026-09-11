const {PDFParse} = require("pdf-parse");

const extractTextFromPDF = async (
  pdfBuffer
) => {

  const parser =
    new PDFParse({
      data: pdfBuffer
    });

  try {

    const result =
      await parser.getText();

    return result.pages;

  } finally {

    await parser.destroy();

  }
};

module.exports = {
  extractTextFromPDF
};

//s3Service.js handles getting files into, out of, and deleting files from S3, while pdfService.js now only cares about parsing PDF data, not where that data is stored.