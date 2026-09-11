const fs = require("fs");

const {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand
} = require("@aws-sdk/client-s3");

const s3Client = require("../config/s3");

const uploadFileToS3 = async (
  filePath,
  key,
  contentType
) => {
  const fileStream =
    fs.createReadStream(filePath);

  const command =
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: fileStream,
      ContentType: contentType
    });

  await s3Client.send(command);

  console.log(
    "File uploaded to S3:",
    key
  );

  return key;
};

const downloadFileFromS3 = async (key) => {
  const command =
    new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    });

  const response =
    await s3Client.send(command);

  return response.Body;
};

const deleteFileFromS3 = async (key) => {
  const command =
    new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    });

  await s3Client.send(command);

  console.log(
    "File deleted from S3:",
    key
  );
};

module.exports = {
  uploadFileToS3,
  downloadFileFromS3,
  deleteFileFromS3
};