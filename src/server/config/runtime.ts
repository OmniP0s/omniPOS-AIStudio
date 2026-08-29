import dotenv from "dotenv";

dotenv.config();

export const serverConfig = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  nodeEnv: process.env.NODE_ENV || "production",
};
