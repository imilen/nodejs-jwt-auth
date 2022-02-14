import dotenv from "dotenv";
import { redisOptionsType } from "../server/db/redis";

dotenv.config({ encoding: "utf8" });

export default {
  port: +JSON.stringify(process.env.PORT) || 80,
  cookieName: JSON.stringify(process.env.COOKIE_NAME) || "sid",
  cookieSecretKey: JSON.stringify(process.env.COOKIE_SECRET_KEY) || "$3cr37",
  redis: {
    host: JSON.stringify(process.env.REDIS_DB) || "localhost",
    port: +JSON.stringify(process.env.REDIS_DB) || 6379,
    pass: JSON.stringify(process.env.REDIS_DB) || "",
    db: +JSON.stringify(process.env.REDIS_DB) || 0,
  } as redisOptionsType,
  mongo: {
    uri:
      JSON.stringify(process.env.MONGODB_URI) ||
      "mongodb://localhost:27017/db?retryWrites=true&w=majority",
    options: {},
  },
  jwt: {
    accessTokenTtl: JSON.stringify(process.env.ACCESS_TOKEN_TTL) || "10m",
    refreshTokenTtl: JSON.stringify(process.env.REFRESH_TOKEN_TTL) || "1h",
  },
};
