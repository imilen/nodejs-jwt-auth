import { Router, Request, Response } from "express";
import ms from "ms";
import _ from "lodash";
import config from "config";

import { redisClient } from "../db/redis";
import { log } from "../utils";
import { User, UserDocument } from "../db/mongo/models";

// extract configuration options
const cookieSecretKey = config.get<string>("cookieSecretKey");
const cookieName = config.get<string>("cookieName");
const { accessTokenTtl, refreshTokenTtl } =
  config.get<{ accessTokenTtl: string; refreshTokenTtl: string }>("jwt");

const user = Router().post("/register", async (req, res) => {
  try {
    await User.register(req.body);
    res.send({ message: "Registration successful!" });
  } catch (error) {
    log.error("user:register " + JSON.stringify(error));
    res.status(400).send({ message: error });
  }
});

export { user };
