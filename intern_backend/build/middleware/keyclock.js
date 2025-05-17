"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryStore = exports.keycloak = void 0;
// backend/middleware/keycloak.ts
const keycloak_connect_1 = __importDefault(require("keycloak-connect"));
const express_session_1 = __importDefault(require("express-session"));
const memoryStore = new express_session_1.default.MemoryStore();
exports.memoryStore = memoryStore;
const keycloak = new keycloak_connect_1.default({ store: memoryStore }, {
    realm: "internrealm",
    "auth-server-url": "http://localhost:8080",
    resource: "nextjs-client",
    "ssl-required": "external",
    "confidential-port": 0,
});
exports.keycloak = keycloak;
