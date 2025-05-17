"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const keyclock_1 = require("../../../middleware/keyclock");
const db_1 = require("../../../client/db");
const router = (0, express_1.Router)();
router.get("/", keyclock_1.keycloak.protect(), async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res
                .status(401)
                .json({ error: "Missing or invalid Authorization header" });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.decode(token);
        const email = decoded.email;
        console.log(email);
        const users = await db_1.prisma.user.findUnique({ where: { email: email } });
        if (!users) {
            return res.status(404).json({ error: "no user found" });
        }
        if (!users?.accessKeyID || !users?.secretAccesskeyId) {
            return res.status(401).json({ error: "Invalid token" });
        }
        return res.status(200).json({
            accessKeyId: users.accessKeyID,
            secretkey: users.secretAccesskeyId,
        });
    }
    catch (err) {
        console.error("Error fetching keys:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
router.post("/", keyclock_1.keycloak.protect(), async (req, res) => {
    console.log("ssss");
    const authHeader = req.headers.authorization;
    const { accessKeyId, secretAccessKey } = await req.body;
    console.log(accessKeyId, secretAccessKey);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({ error: "Missing or invalid Authorization header" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jsonwebtoken_1.default.decode(token);
    try {
        const newuser = await db_1.prisma.user.create({
            data: {
                email: decoded.email,
                name: decoded.given_name,
                accessKeyID: accessKeyId,
                secretAccesskeyId: secretAccessKey,
            },
        });
        res.status(200).json({ user: newuser });
    }
    catch (err) {
        res.status(404).json({ error: "not made the new user" });
    }
});
exports.default = router;
