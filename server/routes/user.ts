import { Router, Request, Response } from "express";
import ms from "ms";
import _ from "lodash";
import config from "config";
import { JwtPayload } from "jsonwebtoken";

import { redisClient } from "../db/redis";
import { generateJwtToken, log } from "../utils";
import { User, UserDocument } from "../db/mongo/models";
import {
  isExistsCookie,
  verifyAccessToken,
  verifyRefreshToken,
} from "../middlewares";

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

const user = Router();

user.post("/register", async (req: Request, res: Response) => {
  try {
    await User.register(req.body);

    res.send({ message: "Registration successful!" });
  } catch (error: any) {
    log.error("user:register: " + error.message);
    res.status(400).send({ message: error.message });
  }
});

user.post("/login", async (req: Request, res: Response) => {
  try {
    const user: UserDocument = await User.login(req.body);

    const accessToken = await generateJwtToken(
      user,
      accessTokenTtl,
      accessTokenFlag
    );

    if (!accessToken) {
      throw new Error("Can not generate an access token!");
    }

    const refreshToken = await generateJwtToken(
      user,
      refreshTokenTtl,
      refreshTokenFlag
    );

    if (!refreshToken) {
      throw new Error("Can not generate a refresh token!");
    }

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
  } catch (error: any) {
    log.error("user:login: " + error.message);
    res.status(400).send({ message: error.message });
  }
});

user.post("/logout", verifyAccessToken, async (req: Request, res: Response) => {
  const accessToken = req.headers.authorization?.split(" ")[1];

  req.session.destroy((error) => {
    if (error) {
      log.error("user:logout " + JSON.stringify(error));
    }
  });

  await redisClient?.set(
    `bat:${accessToken}`,
    "true",
    "PX",
    ((req as Request & { token: JwtPayload }).token.exp as number) * 1000 -
      Date.now()
  );

  res.clearCookie(cookieName);
  res.status(200).send({ accessToken: "" });
});

user.post(
  "/new/token",
  isExistsCookie(cookieName),
  (req: Request, res: Response) => {
    redisClient?.get(
      `sess:${req.signedCookies[cookieName]}`,
      async (err, data) => {
        try {
          if (err) {
            throw new Error("Have a problem with refresh token!");
          }

          if (!data || !JSON.parse(data)?.refreshToken) {
            throw new Error("Have a problem with refresh token!");
          }

          let { refreshToken } = JSON.parse(data);
          const user = (await verifyRefreshToken(refreshToken)) as UserDocument;

          const accessToken = await generateJwtToken(
            user,
            accessTokenTtl,
            accessTokenFlag
          );
          refreshToken = await generateJwtToken(
            user,
            refreshTokenTtl,
            refreshTokenFlag
          );

          // @ts-ignore
          req.session.refreshToken = refreshToken;
          req.session.cookie.originalMaxAge = ms(refreshTokenTtl);

          res.status(200).send({
            accessToken,
          });
        } catch (error: any) {
          log.error(`user:new:token: ${error.message}`);
          res.status(400).send({ message: error.message });
        }
      }
    );
  }
);

export { user };
