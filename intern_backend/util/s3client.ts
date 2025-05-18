// E:\intern_backend\util\s3client.ts
import { S3Client } from "@aws-sdk/client-s3";

const endpoint = process.env.ZATA_ENDPOINT;

const region = process.env.ZATA_REGION || "us-east-1";

export const s3ClientPathStyle = (
  accessKeyId: string | undefined,
  secretAccessKey: string | undefined
): S3Client => {
  if (!accessKeyId || !secretAccessKey) {
    throw new Error("Accesskey id is missing");
  }
  console.log(accessKeyId, secretAccessKey);
  return new S3Client({
    endpoint: `https://idr01.zata.ai`,
    region,
    credentials: {
      accessKeyId: accessKeyId.trim(),
      secretAccessKey: secretAccessKey.trim(),
    },
    forcePathStyle: true,
  });
};
