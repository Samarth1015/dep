"use strict";
// E:\intern_backend\src\routes\fetchbucket\fetchbucket.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_s3_1 = require("@aws-sdk/client-s3");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const s3client_1 = require("../../../util/s3client");
const db_1 = require("../../../client/db");
const router = (0, express_1.Router)();
router.get("/", (async (req, res) => {
    console.log("hitting fetch bucket");
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res
                .status(401)
                .json({ error: "Missing or invalid Authorization header" });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.decode(token);
        const users = await db_1.prisma.user.findUnique({
            where: { email: decoded.email },
        });
        console.log(decoded);
        console.log("--->", users);
        const s3Client = (0, s3client_1.s3ClientPathStyle)(users?.accessKeyID, users?.secretAccesskeyId);
        const command = new client_s3_1.ListBucketsCommand({});
        const response = await s3Client.send(command);
        const buckets = response.Buckets?.map((bucket) => ({
            name: bucket.Name,
            creationDate: bucket.CreationDate,
        })) || [];
        res.status(200).json({
            success: true,
            data: buckets,
        });
    }
    catch (error) {
        console.error("Error fetching buckets:", error);
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
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
}));
exports.default = router;
