import { Router, Request, Response } from "express";
import ms from "ms";
import _ from "lodash";
import config from "config";

import { redisClient } from "../db/redis";
import { generateJwtToken, log } from "../utils";
import { User, UserDocument } from "../db/mongo/models";

// extract configuration options
const cookieSecretKey = config.get<string>("cookieSecretKey");
const cookieName = config.get<string>("cookieName");
const { accessTokenTtl, refreshTokenTtl, accessTokenFlag, refreshTokenFlag } =
  config.get<{
    accessTokenTtl: string;
    refreshTokenTtl: string;
    accessTokenFlag: string;
    refreshTokenFlag: string;
  }>("jwt");

const user = Router()
  .post("/register", async (req: Request, res: Response) => {
    try {
      await User.register(req.body);
      res.send({ message: "Registration successful!" });
    } catch (error) {
      log.error("user:register " + JSON.stringify(error));
      res.status(400).send({ message: error });
    }
  })
  .post("/login", async (req: Request, res: Response) => {
    try {
      const user: UserDocument | null = await User.login(req.body);
      const accessToken = await generateJwtToken(
        user,
        accessTokenTtl,
        accessTokenFlag
      );
      const refreshToken = await generateJwtToken(
        user,
        refreshTokenTtl,
        refreshTokenFlag
      );

      // @ts-ignore
      req.session.refreshToken = refreshToken;
      req.session.cookie.originalMaxAge = ms(refreshTokenTtl);

      const json = {
        user: {
          ..._.pick(user, ["role", "email"]),
        },
        accessToken,
      };

      return res.send(json);
    } catch (error) {
      log.error("user:login " + JSON.stringify(error));
      res.status(400).send({ message: error });
    }
  });

export { user };
