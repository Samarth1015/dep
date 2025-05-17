"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const Redisclient = (0, redis_1.createClient)(); // default: localhost:6379
Redisclient.on("error", (err) => console.error("Redis Client Error", err));
(async () => {
    console.log("connecting");
    await Redisclient.connect();
})();
exports.default = Redisclient;
