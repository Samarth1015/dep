// E:\intern_deploy\intern_backend\src\rabitmq\index.ts

import amqplib from "amqplib";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3ClientPathStyle } from "../../util/s3client";
import { prisma } from "../../client/db";

export const startRabbitMQConsumer = async () => {
  console.log(" RabbitMQ consumer starting...");
  const connectWithRetry = async (url: string, retries = 10, delay = 3000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const connection = await amqplib.connect(url);
        return connection;
      } catch (err) {
        console.log(
          `RabbitMQ connection failed (attempt ${i + 1}/${retries}). Retrying in ${delay / 1000}s...`
        );
        await new Promise((res) => setTimeout(res, delay));
      }
    }
    throw new Error("Failed to connect to RabbitMQ after multiple attempts");
  };

  try {
    console.log("--->", process.env.RABBITMQ_URL);
    const connection = await connectWithRetry(
      process.env.RABBITMQ_URL || "amqp://localhost"
    );

    const channel = await connection.createChannel();
    const queue = "upload-files";

    await channel.assertQueue(queue, { durable: true });

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const data = JSON.parse(msg.content.toString());
        // console.log("--->", data);
        const { files, path: name, bucket, fileNames, email } = data;

        // console.log(" Path:", name);

        const User = await prisma.user.findUnique({
          where: {
            email: email,
          },
        });

        const s3 = s3ClientPathStyle(
          User?.accessKeyID.trim(),
          User?.secretAccesskeyId.trim()
        );

        for (let i = 0; i < files.length; i++) {
          const base64String = files[i];
          const buffer = Buffer.from(base64String, "base64");
          console.log(buffer);

          const originalName = fileNames?.[i] || `file-${i + 1}`;
          const uniqueKey = name
            ? `${name}/${originalName}`
            : `${originalName}`;
          console.log(" Uploading to S3 as:", uniqueKey);

          const command = new PutObjectCommand({
            Bucket: bucket,
            Key: uniqueKey,
            Body: buffer,
          });

          try {
            await s3.send(command);
            console.log(`
             Uploaded file tp S3`);
          } catch (err) {
            console.error(` Upload failed for file`, err);
          }
        }

        channel.ack(msg);
      }
    });

    console.log(" RabbitMQ consumer ready and listening on queue:", queue);
  } catch (err) {
    console.error("🚨 RabbitMQ Consumer Error:", err);
  }
};
