import { Request, Response, NextFunction } from "express";
import jwt, { Jwt, JwtPayload } from "jsonwebtoken";
import fsPromises from "fs/promises";
import path from "path";
import config from "config";

import { log } from "../utils";
import { redisClient } from "../db/redis";

const { accessTokenTtl, refreshTokenTtl, accessTokenFlag, refreshTokenFlag } =
  config.get<{
    accessTokenTtl: string;
    refreshTokenTtl: string;
    accessTokenFlag: string;
    refreshTokenFlag: string;
  }>("jwt");

export async function verifyAccessToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1];

    if (!accessToken) {
      throw "Missing a token in authorization header !";
    }

    const blockedToken = await redisClient.get(`bat:${accessToken}`);

    if (blockedToken) {
      throw "The token is blocked !";
    }

    const publicATKey = await fsPromises.readFile(
      path.join(
        __dirname,
        `../certificate/jwt/rsa_public.${accessTokenFlag}.pem`
      ),
      { encoding: "utf8" }
    );

    const decoded = jwt.verify(accessToken, publicATKey, {
      algorithms: ["RS256"],
    });

    if (!decoded) {
      throw "A token is invalid !";
    }

    (req as Request & { token: JwtPayload | string }).token = decoded;

    next();
  } catch (error) {
    log.error(`${verifyAccessToken.name} ` + JSON.stringify(error));
    res.status(400).send({ message: error });
  }
}

export async function verifyRefreshToken(refreshToken: string) {
  try {
    const publicRTKey = await fsPromises.readFile(
      path.join(
        __dirname,
        `../certificate/jwt/rsa_public.${refreshTokenFlag}.pem`
      ),
      { encoding: "utf8" }
    );

    return jwt.verify(refreshToken, publicRTKey, { algorithms: ["RS256"] });
  } catch (error) {
    log.error(`${verifyRefreshToken.name} ` + JSON.stringify(error));
    return error;
  }
}
