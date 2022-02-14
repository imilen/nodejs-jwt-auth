import express, { Express } from "express";
import http from "http";
import fs from "fs";
import fsP from "fs/promises";
import dotenv from "dotenv";
import path from "path";
import favicon from "serve-favicon";
import cors from "cors";
import cookieParser from "cookie-parser";
import expressSession from "express-session";
import connectRedis from "connect-redis";
import compression from "compression";
import ms from "ms";
import responseTime from "response-time";
import config from "config";
import bcryptjs from "bcryptjs";
import bodyParser from "body-parser";
import ejs from "ejs";
import ioredis from "ioredis";
import jwt from "jsonwebtoken";
import _ from "lodash";
import moment from "moment";
import mongoose from "mongoose";
import redis from "redis";
import winston from "winston";
const jksJs = require("jks-js");

import { log } from "./utils";
import { index } from "./routes/index";
import { mongoConnect } from "./db/mongo";

// extract configuration options
const port = config.get<number>("port");
const cookieSecretKey = config.get<string>("cookieSecretKey");
const cookieName = config.get<string>("cookieName");
const { accessTokenTtl, refreshTokenTtl } =
  config.get<{ accessTokenTtl: string; refreshTokenTtl: string }>("jwt");
const mongo = config.get<{ uri: string; options: object }>("mongo");

function main(): Express {
  // app
  const app = express();

  // app set
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));
  app.set("view cache", true);
  app.set("trust proxy", 1);

  // app middleware
  app.use(cors({ origin: "*" }));
  app.use("/", express.static(path.join(__dirname, "public")));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser(cookieSecretKey));
  app.use(
    expressSession({
      cookie: {
        httpOnly: false,
        secure: false,
        sameSite: true,
        path: "/",
        signed: false,
        encode: decodeURI,
      },
      name: cookieName,
      secret: cookieSecretKey,
      rolling: false,
      resave: false,
      saveUninitialized: false,
    })
  );

  app.use(favicon(path.join(__dirname, "favicon.ico")));
  app.use(compression());
  app.use(responseTime());

  // routes
  app.use("/", index);

  // database
  mongoConnect(mongo.uri, mongo.options);

  return app;
}

// http server
const httpServer = http.createServer(main());
httpServer.listen(port);
httpServer.on("listening", () => log.info(`server:listening ${port} 🔓`));
httpServer.on("error", (error) =>
  log.error("server:error: " + JSON.stringify(error))
);
