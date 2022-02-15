import { Request, Response, NextFunction } from "express";

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
