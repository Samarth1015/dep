import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "backend_consumer",
  brokers: ["localhost:9092"],
});
