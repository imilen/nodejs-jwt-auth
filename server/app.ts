import express from "express";
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
import bodyParser from "body-parser";
import passport from "passport";

import { generateJwtKeys } from "./utils";
import { redisClient } from "./db/redis";
import { admin, home, user } from "./routes";
import { jwtOptionsType, mongoOptionsType } from "../config/default";

// extract configuration options
const cookieSecretKey = config.get<string>("cookieSecretKey");
const cookieName = config.get<string>("cookieName");
const { accessTokenTtl, refreshTokenTtl, accessTokenFlag, refreshTokenFlag } =
  config.get<jwtOptionsType>("jwt");
const mongo = config.get<mongoOptionsType>("mongo");

// app
export const app = express();

const RedisStore = connectRedis(expressSession);

// app set
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("view cache", true);
app.set("trust proxy", 1);

// app middleware
app.use(cors({ origin: "*" }));
app.use("/", express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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
    store: new RedisStore({
      client: redisClient,
      disableTouch: true,
      ttl: ms(refreshTokenTtl) / 1000,
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(favicon(path.join(__dirname, "favicon.ico")));
app.use(compression());
app.use(responseTime());

// http -> https
// app.use(function (req, res, next) {
//   if (!req.secure) {
//     res.redirect(301, `https://${req.hostname}${req.url}`);
//   } else {
//     return next();
//   }
// });

// routes
app.use("/", home);
app.use("/api/user", user);
app.use("/api/admin", admin);

// generate jwt keys - private and public
generateJwtKeys();
