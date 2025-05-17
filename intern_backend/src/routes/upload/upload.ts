// E:/intern_backend/src/routes/upload/upload.ts

import express from "express";
import multer from "multer";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import jwt from "jsonwebtoken";
import { prisma } from "../../../client/db";
import { s3ClientPathStyle } from "../../../util/s3client";
// import Redisclient from "../../../client/redis";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("file"), async (req: any, res: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.decode(token) as { email?: string };

    if (!decoded || !decoded.email) {
      return res.status(401).json({ error: "Invalid token or missing email" });
    }

    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user?.accessKeyID || !user?.secretAccesskeyId) {
      return res.status(403).json({ error: "Missing S3 credentials" });
    }

    const { bucket, path } = req.body;
    const file = req.file;

    if (!bucket || !file) {
      return res.status(400).json({ error: "Bucket or file missing" });
    }

    const s3 = s3ClientPathStyle(user.accessKeyID, user.secretAccesskeyId);

    const key = path || file.originalname;
    // console.log("===>", key);a

    const command = new PutObjectCommand({
      Bucket: bucket.trim(),
      Key: key,
      Body: file.buffer,
    });

    const data = await s3.send(command);
    // console.log(data);
    // const presignedUrl = await getSignedUrl(
    //   s3,
    //   new GetObjectCommand({ Bucket: bucket.trim(), Key: path }),
    //   { expiresIn: 3600 }
    // );
    // // console.log(presignedUrl);
    // try {
    //   const existing = await Redisclient.get(bucket.trim());
    //   const list = existing ? JSON.parse(existing) : [];

    //   list.push({ key: path, pathStyleUrl: presignedUrl });

    //   await Redisclient.set(bucket.trim(), JSON.stringify(list));
    // } catch (err) {
    //   console.log(err);
    // }

    return res.status(200).json({
      message: "File uploaded successfully",
      path: key,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Failed to upload file" });
  }
});

export default router;
