import { Router, Request, Response } from "express";

const index = Router();

index.get("/", async (req: Request, res: Response) => {
  res.render("index");
});

export { index };
