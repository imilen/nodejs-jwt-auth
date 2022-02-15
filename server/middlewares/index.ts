import { Request, Response, NextFunction } from "express";
import _ from "lodash";

import { userRoles } from "../db/mongo/models";
import { log } from "../utils";
export * from "./jwt";

export function isExistsCookie(cookieName: string) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.signedCookies[cookieName]) {
        throw "Have a problem with refresh token !";
      }

      next();
    } catch (error) {
      log.error(`${isExistsCookie.name} ` + JSON.stringify(error));
      res.status(400).send({ message: error });
    }
  };
}

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    // @ts-ignore
    if (!_.eq(req.token.role, userRoles[1])) {
      throw "Yor are not a admin !";
    }

    next();
  } catch (error) {
    log.error(`${isAdmin.name} ` + JSON.stringify(error));
    res.status(400).send({ message: error });
  }
}
