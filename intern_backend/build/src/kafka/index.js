"use strict";
// src/kafka/consumer.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.startConsumer = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3client_1 = require("../../util/s3client");
const kafka_1 = require("../../client/kafka");
const db_1 = require("../../client/db");
const consumer = kafka_1.kafka.consumer({ groupId: "file-group" });
const startConsumer = async () => {
    console.log("consumerstarter");
    await consumer.connect();
    await consumer.subscribe({ topic: "upload-files", fromBeginning: true });
    await consumer.run({
        eachMessage: async ({ message }) => {
            const data = JSON.parse(message.value?.toString() || "{}");
            const { file, name, bucket, fileNames, email } = data;
            console.log("===>", name);
            const User = await db_1.prisma.user.findUnique({
                where: {
                    email: email,
                },
            });
            const s3 = (0, s3client_1.s3ClientPathStyle)(User?.accessKeyID.trim(), User?.secretAccesskeyId.trim());
            for (let i = 0; i < file.length; i++) {
                const base64String = file[i];
                const buffer = Buffer.from(base64String, "base64");
                const originalName = fileNames?.[i] || `file-${i + 1}`;
                const uniqueKey = name ? `${name}/${originalName}` : `${originalName}`;
                console.log("---------------->", uniqueKey);
                const command = new client_s3_1.PutObjectCommand({
                    Bucket: bucket,
                    Key: uniqueKey,
                    Body: buffer,
                });
                try {
                    await s3.send(command);
                    console.log(` Uploaded file ${i + 1} to S3 as: ${uniqueKey}`);
                }
                catch (err) {
                    console.error(` Upload failed for file ${i + 1}:`, err);
                }
            }
        },
    });
};
exports.startConsumer = startConsumer;
