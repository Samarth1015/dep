"use strict";
// E:/intern_backend/src/routes/upload/upload.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const client_s3_1 = require("@aws-sdk/client-s3");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../../../client/db");
const s3client_1 = require("../../../util/s3client");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.post("/", upload.single("file"), async (req, res) => {
    try {
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
        const { bucket, path } = req.body;
        const file = req.file;
        if (!bucket || !file) {
            return res.status(400).json({ error: "Bucket or file missing" });
        }
        const s3 = (0, s3client_1.s3ClientPathStyle)(user.accessKeyID, user.secretAccesskeyId);
        const key = path || file.originalname;
        // console.log("===>", key);a
        const command = new client_s3_1.PutObjectCommand({
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
    }
    catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json({ error: "Failed to upload file" });
    }
});
exports.default = router;
