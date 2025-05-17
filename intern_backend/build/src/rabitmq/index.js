"use strict";
// src/rabbitmq/consumer.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRabbitMQConsumer = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3client_1 = require("../../util/s3client");
const db_1 = require("../../client/db");
const startRabbitMQConsumer = async () => {
    console.log(" RabbitMQ consumer starting...");
    try {
        const connection = await amqplib_1.default.connect("amqp://localhost");
        const channel = await connection.createChannel();
        const queue = "upload-files";
        await channel.assertQueue(queue, { durable: true });
        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                const data = JSON.parse(msg.content.toString());
                // console.log("--->", data);
                const { files, path: name, bucket, fileNames, email } = data;
                // console.log(" Path:", name);
                const User = await db_1.prisma.user.findUnique({
                    where: {
                        email: email,
                    },
                });
                const s3 = (0, s3client_1.s3ClientPathStyle)(User?.accessKeyID.trim(), User?.secretAccesskeyId.trim());
                for (let i = 0; i < files.length; i++) {
                    const base64String = files[i];
                    const buffer = Buffer.from(base64String, "base64");
                    console.log(buffer);
                    const originalName = fileNames?.[i] || `file-${i + 1}`;
                    const uniqueKey = name
                        ? `${name}/${originalName}`
                        : `${originalName}`;
                    console.log(" Uploading to S3 as:", uniqueKey);
                    const command = new client_s3_1.PutObjectCommand({
                        Bucket: bucket,
                        Key: uniqueKey,
                        Body: buffer,
                    });
                    try {
                        await s3.send(command);
                        console.log(`
             Uploaded file tp S3`);
                    }
                    catch (err) {
                        console.error(` Upload failed for file`, err);
                    }
                }
                channel.ack(msg);
            }
        });
        console.log(" RabbitMQ consumer ready and listening on queue:", queue);
    }
    catch (err) {
        console.error("🚨 RabbitMQ Consumer Error:", err);
    }
};
exports.startRabbitMQConsumer = startRabbitMQConsumer;
