require("dotenv").config();

const { Worker } = require("bullmq");

const redisConnection = require("../config/redis");
const connectDB = require("../config/db");

const Document = require("../models/Document");
const Chunk = require("../models/Chunk");

const { extractTextFromPDF } = require("../services/pdfService");
const chunkText = require("../utils/chunkText");
const { generateEmbedding } = require("../services/embeddingService");
const {
  downloadFileFromS3
} = require("../services/s3Service");
// Connect worker to MongoDB
connectDB();

const documentWorker = new Worker(
  "document-processing",//"Create a worker that listens to the document-processing queue. Whenever a job from this queue is available, give that job to this function."
  async (job) => {//receives that job.
    const startTime = Date.now();
    const {
      documentId,
      userId,
      s3Key
    } = job.data;//"Take the data belonging to whichever job BullMQ just handed me.

    await Document.findOneAndUpdate(
    {
      _id: documentId,
      userId
    },
    {
      status: "processing"
    }
    );
    const processingTime =Date.now() - startTime;
    
    console.log(`Document ${documentId} processed in ${processingTime} ms`);
    //throw new Error("TEST RETRY");

    try {

    //throw new Error("TEST RETRY");
    // 1. Extract PDF pages
    console.log("Downloading PDF from S3:", s3Key);

    const pdfStream = await downloadFileFromS3(s3Key);

    const pdfBuffer =await pdfStream.transformToByteArray();

    console.log("PDF downloaded from S3");

    const pages = await extractTextFromPDF(Buffer.from(pdfBuffer));

    console.log("Pages extracted:",pages.length);

      // 2. Convert pages into chunks
      const chunks = chunkText(pages);

      console.log("Total chunks:",chunks.length);

      // 3. Make sure chunks exist
      if (chunks.length === 0) {
        throw new Error(
          "No text could be extracted from PDF"
        );
      }

      // 4. Generate embeddings
      const chunkDocuments = [];

      for (let i = 0; i < chunks.length; i++) {
        console.log( `Generating embedding ${i + 1}/${chunks.length}`);

        const embedding = await generateEmbedding(chunks[i].text);

        chunkDocuments.push({
          documentId,
          userId,
          text: chunks[i].text,
          chunkIndex: i,
          pageNumber: chunks[i].pageNumber,
          embedding
        });
      }

      console.log("Chunk documents ready:", chunkDocuments.length);

      // 5. Remove old chunks if any
      await Chunk.deleteMany({ documentId, userId});

      // 6. Store chunks + embeddings
      await Chunk.insertMany(chunkDocuments);

      console.log( "Chunks inserted successfully");
    //throw new Error("TEST IDEMPOTENCY");
      // 7. Mark document as ready
      await Document.findOneAndUpdate(
        {
          _id: documentId,
          userId
        },
        {
          status: "ready"
        }
      );

      console.log(
        `Document ${documentId} is ready`
      );

      return {
        documentId,
        totalPages: pages.length,
        totalChunks: chunks.length
      };

    } catch (error) {
  console.error(
    `Document processing failed: ${documentId}`,
    error.message
  );

  const isLastAttempt =
    job.attemptsMade + 1 >= job.opts.attempts;

  if (isLastAttempt) {
    await Document.findOneAndUpdate(
      {
        _id: documentId,
        userId
      },
      {
        status: "failed"
      }
    );

    console.log(
      `Document ${documentId} permanently failed`
    );
  } else {
    await Document.findOneAndUpdate(
      {
        _id: documentId,
        userId
      },
      {
        status: "processing"
      }
    );

    console.log(
      `Document ${documentId} will be retried`
    );
  }

  throw error;
}
  },
  {
    connection: redisConnection,
    concurrency:1//It means one worker process can actively process one job at a time.
  }
);

documentWorker.on("completed", (job) => {
     console.log(`Job ${job.id} completed`);
    });

documentWorker.on("failed", (job, error) => {
  console.error(
    `Job ${job?.id} failed:`,
    error.message
  );
});

console.log("Document worker started");