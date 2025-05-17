// E:\intern_backend\src\routes\fetchbucket\fetchbucket.ts

import { Router, Request, Response, RequestHandler } from "express";
import { ListBucketsCommand } from "@aws-sdk/client-s3";
import jwt from "jsonwebtoken";

import { s3ClientPathStyle } from "../../../util/s3client";
import { prisma } from "../../../client/db";

const router = Router();

router.get("/", (async (req: Request, res: Response) => {
  console.log("hitting fetch bucket");
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Missing or invalid Authorization header" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = (await jwt.decode(token)) as { email: string };

    const users = await prisma.user.findUnique({
      where: { email: decoded.email },
    });
    console.log(decoded);
    const s3Client = s3ClientPathStyle(
      users?.accessKeyID,
      users?.secretAccesskeyId
    );

    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);

    const buckets =
      response.Buckets?.map((bucket) => ({
        name: bucket.Name,
        creationDate: bucket.CreationDate,
      })) || [];

    res.status(200).json({
      success: true,
      data: buckets,
    });
  } catch (error) {
    console.error("Error fetching buckets:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
      });
    }
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch buckets",
    });
  }
}) as RequestHandler);

export default router;
