import { Router, Request, Response } from "express";
import _ from "lodash";

import { User, userRoles } from "../db/mongo/models";
import { isAdmin, verifyAccessToken } from "../middlewares";
import { log } from "../utils";

const admin = Router();

admin.get(
  "/",
  verifyAccessToken,
  isAdmin,
  async (req: Request, res: Response) => {
    try {
      // @ts-ignore
      const user = await User.findOne({ email: req.token.email })
        .select("email password id role")
        .exec();

      // @ts-ignore
      if (!_.eq(user.role, userRoles[1])) {
        throw new Error("Yor are not a admin!");
      } else {
        res.send({ message: "You are an admin!", user });
      }
    } catch (error: any) {
      log.error(`admin: ${error.message}`);
      res.status(400).send({ message: error.message });
    }
  }
);

export { admin };
