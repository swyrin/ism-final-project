import { S3Client, PutObjectCommand, DeleteObjectCommand, CopyObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
  endpoint: process.env.S3_ENDPOINT!,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true,
});

const bucket = process.env.S3_BUCKET!;

export async function uploadFile(key: string, buffer: Buffer, contentType: string): Promise<void> {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );
}

export async function deleteFile(key: string): Promise<void> {
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}

export function buildFileUrl(key: string): string {
  return `${process.env.S3_ENDPOINT}/${bucket}/${key}`;
}
/**
 * Copy an object to another key, optionally across buckets.
 *
 * @param {string | null} [sourceBucket=null]
 * @param {string} sourcePath
 * @param {string | null} [destinationBucket=null]
 * @param {string} destinationPath
 * @returns {Promise<boolean>}
 */
export async function copyFile(
  sourcePath: string,
  destinationPath: string,
  sourceBucket?: string,
  destinationBucket?: string,
): Promise<boolean> {
  if (!sourceBucket) sourceBucket = bucket;
  if (!destinationBucket) destinationBucket = bucket;
  const command = new CopyObjectCommand({
    Bucket: destinationBucket, // target bucket
    CopySource: `${sourceBucket}/${sourcePath}`, // source bucket + key
    Key: destinationPath, //  new path
    MetadataDirective: "COPY", // keep metadata (better default)
  });
  await client.send(command);
  return true;
}
