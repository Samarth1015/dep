"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// E:\intern_backend\Service\JWTservice\jwtverify.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../../client/db");
const config_1 = require("../../src/config/config");
class JWTService {
    static async tokenVerify(googleToken) {
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${googleToken}` },
            method: "GET",
        });
        const data = await res.json();
        if (!res.ok || data.error) {
            return {
                error: data.error || "invalid_request",
                error_description: data.error_description || "Invalid token",
            };
        }
        return data;
    }
    static async generateJWT(id, tokenType = "access") {
        const secret = tokenType === "access" ? config_1.JWT_SECRET : config_1.REFRESH_TOKEN_SECRET;
        const expiresIn = tokenType === "access" ? "7d" : "7d";
        const user = await db_1.prisma.user.findUnique({ where: { id: id } });
        const payload = {
            id: user?.id,
            email: user?.email,
            accessKey: user?.accessKeyID,
            secretAccessKey: user?.secretAccesskeyId,
        };
        const token = jsonwebtoken_1.default.sign(payload, secret, {
            expiresIn,
        });
        return token;
    }
    static verifyJWT(token, tokenType = "access") {
        const secret = tokenType === "access" ? config_1.JWT_SECRET : config_1.REFRESH_TOKEN_SECRET;
        try {
            return jsonwebtoken_1.default.verify(token, secret);
        }
        catch (error) {
            throw error;
        }
    }
    static async refreshAccessToken(refreshToken) {
        try {
            const decoded = this.verifyJWT(refreshToken, "refresh");
            return await this.generateJWT(decoded.id, "access");
        }
        catch (error) {
            throw new Error("Invalid refresh token");
        }
    }
}
exports.default = JWTService;
