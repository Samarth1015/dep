// src/kafka/consumer.ts

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3ClientPathStyle } from "../../util/s3client";
import { kafka } from "../../client/kafka";
import { prisma } from "../../client/db";

const consumer = kafka.consumer({ groupId: "file-group" });

export const startConsumer = async () => {
  console.log("consumerstarter");
  await consumer.connect();
  await consumer.subscribe({ topic: "upload-files", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const data = JSON.parse(message.value?.toString() || "{}");
      const { file, name, bucket, fileNames, email } = data;
      console.log("===>", name);

      const User = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      const s3 = s3ClientPathStyle(
        User?.accessKeyID.trim(),
        User?.secretAccesskeyId.trim()
      );

      for (let i = 0; i < file.length; i++) {
        const base64String = file[i];
        const buffer = Buffer.from(base64String, "base64");

        const originalName = fileNames?.[i] || `file-${i + 1}`;
        const uniqueKey = name ? `${name}/${originalName}` : `${originalName}`;
        console.log("---------------->", uniqueKey);

        const command = new PutObjectCommand({
          Bucket: bucket,
          Key: uniqueKey,
          Body: buffer,
        });

        try {
          await s3.send(command);
          console.log(` Uploaded file ${i + 1} to S3 as: ${uniqueKey}`);
        } catch (err) {
          console.error(` Upload failed for file ${i + 1}:`, err);
        }
      }
    },
  });
};
