"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFRESH_TOKEN_SECRET = exports.JWT_SECRET = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    port: Number(process.env.PORT) || 4000,
    nodeEnv: process.env.NODE_ENV || "development",
    JWT_SECRET: process.env.JWT_SECRET || "your-jwt-secret-key",
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "your-refresh-token-secret-key",
};
exports.JWT_SECRET = config.JWT_SECRET, exports.REFRESH_TOKEN_SECRET = config.REFRESH_TOKEN_SECRET;
exports.default = config;
