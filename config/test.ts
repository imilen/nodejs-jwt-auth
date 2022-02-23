import dotenv from "dotenv";

dotenv.config({ encoding: "utf8" });

export type mongoOptionsType = {
  uri: string;
  options: {};
};

export type redisOptionsType = {
  host: string;
  port: number;
  pass: string;
  db: number;
};

export type jwtOptionsType = {
  accessTokenTtl: string;
  refreshTokenTtl: string;
  accessTokenFlag: string;
  refreshTokenFlag: string;
};

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
  } as mongoOptionsType,
  jwt: {
    accessTokenTtl: JSON.stringify(process.env.ACCESS_TOKEN_TTL) || "10m",
    refreshTokenTtl: JSON.stringify(process.env.REFRESH_TOKEN_TTL) || "1h",
    accessTokenFlag: JSON.stringify(process.env.ACCESS_TOKEN_FLAG) || "at",
    refreshTokenFlag: JSON.stringify(process.env.REFRESH_TOKEN_FLAG) || "rt",
  } as jwtOptionsType,
};
