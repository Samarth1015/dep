import express from "express";
import config from "./config/config";
import app from "./app";
import { startRabbitMQConsumer } from "./rabitmq";

app.listen(config.port, async () => {
  // startConsumer();
  await startRabbitMQConsumer();

  console.log(`Server running on port ${config.port}`);
});
