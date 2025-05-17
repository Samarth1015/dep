"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFRESH_TOKEN_SECRET = exports.JWT_SECRET = void 0;
exports.JWT_SECRET = process.env.JWT_SECRET || "default_access_secret";
exports.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "default_refresh_secret";
