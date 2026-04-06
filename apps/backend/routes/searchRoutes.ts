import * as searchService from "@srv/services/searchService";
import { HttpError } from "@srv/utils/HttpError";
import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    res.json(await searchService.search(req.query as Record<string, unknown>));
  } catch (error) {
    if (error instanceof HttpError) res.status(error.status).json({ error: error.error });
    else {
      res.status(500).json({ error: "internal error." });
    }
  }
});

export default router;
