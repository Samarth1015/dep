"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config/config"));
const app_1 = __importDefault(require("./app"));
const rabitmq_1 = require("./rabitmq");
app_1.default.listen(config_1.default.port, async () => {
    // startConsumer();
    await (0, rabitmq_1.startRabbitMQConsumer)();
    console.log(`Server running on port ${config_1.default.port}`);
});
