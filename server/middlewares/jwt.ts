import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import fs from "fs";
import pify from "pify";
import path from "path";
import config from "config";
import _ from "lodash";

import { log } from "../utils";
import { redisClient } from "../db/redis";
import { jwtOptionsType } from "../../config/default";

const {
  accessTokenTtl,
  refreshTokenTtl,
  accessTokenFlag,
  refreshTokenFlag,
  algorithms,
} = config.get<jwtOptionsType>("jwt");

const jwtKeysPath = path.join(__dirname, "..", "certificate", "jwt");

export async function verifyAccessToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!_.has(req.headers, "authorization")) {
      throw new Error("Missing a token in authorization header!");
    }

    const accessToken = req.headers.authorization?.split(" ")[1];

    if (!accessToken) {
      throw new Error("Missing a token in authorization header!");
    }

    const blockedToken = await redisClient?.get(`bat:${accessToken}`);

    if (blockedToken) {
      throw new Error("The token is blocked!");
    }

    const publicATKey = await pify(fs.readFile)(
      path.join(jwtKeysPath, `rsa_public.${accessTokenFlag}.pem`),
      { encoding: "utf8" }
    );

    const decoded = jwt.verify(accessToken, publicATKey, {
      algorithms: ["RS256"],
    });

    if (!decoded) {
      throw new Error("A token is invalid!");
    }

    (req as Request & { token: JwtPayload | string }).token = decoded;

    next();
  } catch (error: any) {
    log.error(`${verifyAccessToken.name}: ${error.message}`);
    res.status(400).send({ message: error.message });
  }
}

export async function verifyRefreshToken(
  refreshToken: string
): Promise<string | JwtPayload> {
  try {
    const publicRTKey = await pify(fs.readFile)(
      path.join(jwtKeysPath, `rsa_public.${refreshTokenFlag}.pem`),
      { encoding: "utf8" }
    );

    return jwt.verify(refreshToken, publicRTKey, { algorithms: algorithms });
  } catch (error: any) {
    log.error(`${verifyRefreshToken.name}: ${error}`);
    return error;
  }
}
