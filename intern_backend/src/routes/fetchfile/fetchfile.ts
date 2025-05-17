// E:/intern_backend/src/routes/fetchfile/fetchfile.ts

import express from "express";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  BucketAlreadyExists,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import jwt from "jsonwebtoken";
import { prisma } from "../../../client/db";
import { s3ClientPathStyle } from "../../../util/s3client";
// import Redisclient from "../../../client/redis";

const router = express.Router();

interface ReqBody {
  bucket: string;
}

router.post("/", async (req: any, res: any) => {
  try {
    const { bucket }: ReqBody = req.body;
    if (!bucket) {
      return res.status(400).json({ error: "Bucket name is required" });
    }

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

    const s3 = s3ClientPathStyle(user.accessKeyID, user.secretAccesskeyId);
    // ---------cacheee part----------
    // const cachedata = await Redisclient.get(bucket.trim());
    // if (cachedata) {
    //   console.log("chache hit");
    //   const parsedData = await JSON.parse(cachedata);

    //   return res.status(200).json(parsedData.filter(Boolean));
    // }
    console.log("cache miss");
    const command = new ListObjectsV2Command({ Bucket: bucket.trim() });
    const response = await s3.send(command);

    const files = await Promise.all(
      (response.Contents || []).map(async (item) => {
        if (!item.Key) return null;
        const presignedUrl = await getSignedUrl(
          s3,
          new GetObjectCommand({ Bucket: bucket.trim(), Key: item.Key }),
          { expiresIn: 3600 }
        );

        return {
          key: item.Key,
          pathStyleUrl: presignedUrl,
        };
      })
    );

    // await Redisclient.set(bucket, JSON.stringify(files.filter(Boolean)), {
    //   EX: 60,
    // });

    return res.json(files.filter(Boolean));
  } catch (error) {
    console.error("Error listing files:", error);
    return res.status(500).json({ error: "Failed to list files" });
  }
});

export default router;
