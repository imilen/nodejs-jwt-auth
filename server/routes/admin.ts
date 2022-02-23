import { Router, Request, Response, NextFunction } from "express";
import _ from "lodash";
import passport from "passport";

import { log } from "../utils";
import "../passport";
import { userRoles } from "../db/mongo/models";

const admin = Router();

admin.get("/", async (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("jwt", { session: false }, async (err, user, info) => {
    try {
      if (err) {
        throw err;
      }
      if (user && _.eq(user.role, userRoles[1])) {
        res.send({ message: "You are an admin!", user });
      } else {
        throw new Error("Yor are not a admin!");
      }
    } catch (error: any) {
      log.error(`admin: ${error.message}`);
      res.status(400).send({ message: error.message });
    }
  })(req, res, next);
});

export { admin };
