"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// E:\intern_backend\src\routes\token\token.ts
const express_1 = require("express");
const jwtverify_1 = __importDefault(require("../../../Service/JWTservice/jwtverify"));
const db_1 = require("../../../client/db");
const router = (0, express_1.Router)();
const handleToken = async (req, res, next) => {
    try {
        console.log("req in verify");
        const { googleToken, accesskey, secretaccesskey } = req.body;
        if (!googleToken || !accesskey || !secretaccesskey) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }
        const result = await jwtverify_1.default.tokenVerify(googleToken);
        if ("error" in result) {
            const error = result;
            res.status(401).json({
                message: "Google token verification failed",
                details: error.error_description,
            });
            return;
        }
        const decodedPayload = result;
        console.log("Decoded Google User:", decodedPayload);
        const existingUser = await db_1.prisma.user.findUnique({
            where: { email: decodedPayload.email },
        });
        if (!existingUser) {
            const newUser = await db_1.prisma.user.create({
                data: {
                    email: decodedPayload.email,
                    name: decodedPayload.given_name,
                    accessKeyID: accesskey,
                    secretAccesskeyId: secretaccesskey,
                },
            });
            res.status(200).json({ token: await jwtverify_1.default.generateJWT(newUser.id) });
            return;
        }
        res
            .status(200)
            .json({ token: await jwtverify_1.default.generateJWT(existingUser.id) });
    }
    catch (err) {
        console.error("Error in /token route:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
const handleVerifyGoogleToken = async (req, res, next) => {
    try {
        const { googleToken, secretaccesskey, accesskey } = req.body;
        if (!googleToken || !secretaccesskey || !accesskey) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }
        const result = await jwtverify_1.default.tokenVerify(googleToken);
        if ("error" in result) {
            res.status(401).json({ error: "Invalid Google token" });
            return;
        }
        const decodedPayload = result;
        const user = (await db_1.prisma.user.findUnique({
            where: { email: decodedPayload.email },
        })) ||
            (await db_1.prisma.user.create({
                data: {
                    email: decodedPayload.email,
                    name: decodedPayload.given_name,
                    accessKeyID: accesskey,
                    secretAccesskeyId: secretaccesskey,
                },
            }));
        const accessToken = await jwtverify_1.default.generateJWT(user.id, "access");
        const refreshToken = await jwtverify_1.default.generateJWT(user.id, "refresh");
        console.log("tmkc");
        res.json({
            accessToken,
            refreshToken,
        });
    }
    catch (error) {
        console.error("Error verifying Google token:", error);
        res.status(401).json({ error: "Invalid credentials" });
    }
};
const handleRefresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({ error: "Refresh token is required" });
            return;
        }
        const newAccessToken = await jwtverify_1.default.refreshAccessToken(refreshToken);
        res.json({ accessToken: newAccessToken });
    }
    catch (error) {
        console.error("Error refreshing token:", error);
        res.status(401).json({ error: "Invalid refresh token" });
    }
};
const handleVerifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ error: "Missing or invalid token" });
            return;
        }
        const token = authHeader.split(" ")[1];
        await jwtverify_1.default.verifyJWT(token, "access");
        res.status(200).json({ valid: true });
    }
    catch (error) {
        console.error("Error verifying token:", error);
        res.status(401).json({ error: "Invalid token" });
    }
};
router.post("/", handleToken);
router.post("/verifyGoogleToken", handleVerifyGoogleToken);
router.post("/refresh", handleRefresh);
router.get("/verifyToken", handleVerifyToken);
exports.default = router;
