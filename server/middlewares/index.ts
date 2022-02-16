import { Request, Response, NextFunction } from "express";
import _ from "lodash";

import { userRoles } from "../db/mongo/models";
import { log } from "../utils";
export * from "./jwt";

export function isExistsCookie(cookieName: string) {
  return async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.signedCookies[cookieName]) {
        throw new Error("Have a problem with refresh token!");
      }

      next();
    } catch (error: any) {
      log.error(`${isExistsCookie.name}: ${error.message}`);
      res.status(400).send({ message: error.message });
    }
  };
}

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    // @ts-ignore
    if (!_.eq(req.token.role, userRoles[1])) {
      throw new Error("Yor are not a admin!");
    }

    next();
  } catch (error: any) {
    log.error(`${isAdmin.name}: ${error.message}`);
    res.status(400).send({ message: error.message });
  }
}
