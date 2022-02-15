import { Router, Request, Response } from "express";

const home = Router();

home.get("/", async (req: Request, res: Response) => {
  res.render("index");
});

export { home };
