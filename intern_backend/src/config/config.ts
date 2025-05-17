import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  JWT_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
}

const config: Config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  JWT_SECRET: process.env.JWT_SECRET || "your-jwt-secret-key",
  REFRESH_TOKEN_SECRET:
    process.env.REFRESH_TOKEN_SECRET || "your-refresh-token-secret-key",
};

export const { JWT_SECRET, REFRESH_TOKEN_SECRET } = config;
export default config;
