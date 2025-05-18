"use strict";
// E:/intern_backend/src/routes/fetchfile/fetchfile.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../../../client/db");
const s3client_1 = require("../../../util/s3client");
// import Redisclient from "../../../client/redis";
const router = express_1.default.Router();
router.post("/", async (req, res) => {
    try {
        const { bucket } = req.body;
        if (!bucket) {
            return res.status(400).json({ error: "Bucket name is required" });
        }
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Missing or invalid token" });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.decode(token);
        if (!decoded || !decoded.email) {
            return res.status(401).json({ error: "Invalid token or missing email" });
        }
        const user = await db_1.prisma.user.findUnique({
            where: { email: decoded.email },
        });
        if (!user?.accessKeyID || !user?.secretAccesskeyId) {
            return res.status(403).json({ error: "Missing S3 credentials" });
        }
        const s3 = (0, s3client_1.s3ClientPathStyle)(user.accessKeyID, user.secretAccesskeyId);
        // ---------cacheee part----------
        // const cachedata = await Redisclient.get(bucket.trim());
        // if (cachedata) {
        //   console.log("chache hit");
        //   const parsedData = await JSON.parse(cachedata);
        //   return res.status(200).json(parsedData.filter(Boolean));
        // }
        console.log("cache miss");
        const command = new client_s3_1.ListObjectsV2Command({ Bucket: bucket.trim() });
        const response = await s3.send(command);
        const files = await Promise.all((response.Contents || []).map(async (item) => {
            if (!item.Key)
                return null;
            const presignedUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3, new client_s3_1.GetObjectCommand({ Bucket: bucket.trim(), Key: item.Key }), { expiresIn: 3600 });
            return {
                key: item.Key,
                pathStyleUrl: presignedUrl,
            };
        }));
        // await Redisclient.set(bucket, JSON.stringify(files.filter(Boolean)), {
        //   EX: 60,
        // });
        return res.json(files.filter(Boolean));
    }
    catch (error) {
        console.error("Error listing files:", error);
        return res.status(500).json({ error: "Failed to list files" });
    }
});
exports.default = router;
