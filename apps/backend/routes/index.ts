import { type Request, type Response, Router } from "express";
// import express, { Router } from "express";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json({ message: "KiMS API" });
});

export default router;
