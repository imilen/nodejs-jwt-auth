import passport from "passport";
import {
  ExtractJwt,
  Strategy as JwtStrategy,
  VerifiedCallback,
} from "passport-jwt";
import fs from "fs";
import pify from "pify";
import path from "path";
import config from "config";
import _ from "lodash";

import { User } from "./db/mongo/models";
import { log } from "./utils";
import { jwtOptionsType } from "../config/default";

const {
  accessTokenTtl,
  refreshTokenTtl,
  accessTokenFlag,
  refreshTokenFlag,
  algorithms,
} = config.get<jwtOptionsType>("jwt");

const jwtKeysPath = path.join(__dirname, "certificate", "jwt");

passport.serializeUser((user: any, cb) => {
  log.info(`passport:serializeUser ${JSON.stringify(user)}`);
  cb(null, user.id);
});
passport.deserializeUser(async (id, cb) => {
  log.info(`passport:deserializeUser ${id}`);

  try {
    const user = await User.findById(id).exec();
    cb(null, user);
  } catch (error) {
    log.error(`passport:deserializeUser ${JSON.stringify(error)}`);
    cb(error);
  }
});

passport.use(
  "jwt",
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      algorithms,
      secretOrKeyProvider: async (req, token, cb) => {
        try {
          if (!token) {
            throw new Error("Missing a token in authorization header!");
          }

          const publicATKey = await pify(fs.readFile)(
            path.join(jwtKeysPath, `rsa_public.${accessTokenFlag}.pem`),
            { encoding: "utf8" }
          );
          return cb(null, publicATKey);
        } catch (error) {
          log.error(`JwtStrategy ${JSON.stringify(error)}`);
          return cb(error);
        }
      },
      jsonWebTokenOptions: { algorithms: algorithms },
    },
    async (payload: any, cb: VerifiedCallback) => {
      try {
        const user = await User.findOne({ email: payload.email }).exec();
        return cb(null, user);
      } catch (error: any) {
        log.error(`JwtStrategy ${JSON.stringify(error)}`);
        return cb(error);
      }
    }
  )
);
