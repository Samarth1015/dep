"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// E:\intern_backend\src\routes\isCredGiven\isCregGive.ts
const express_1 = require("express");
const jwtverify_1 = __importDefault(require("../../../Service/JWTservice/jwtverify"));
const db_1 = require("../../../client/db");
const router = (0, express_1.Router)();
router.post("/", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }
        const user = await db_1.prisma.user.findUnique({
            where: { email: email },
        });
        if (user) {
            // Generate both access and refresh tokens
            const accessToken = await jwtverify_1.default.generateJWT(user.id, "access");
            const refreshToken = await jwtverify_1.default.generateJWT(user.id, "refresh");
            return res.status(200).json({
                present: true,
                accessToken: accessToken,
                refreshToken: refreshToken,
            });
        }
        return res.status(200).json({ present: false });
    }
    catch (error) {
        console.error("Error in isCredGiven:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
