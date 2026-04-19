import { requireAuth } from "@srv/middleware/middleware.auth";
import * as searchService from "@srv/services/searchService";
import { handleError } from "@srv/utils/HttpError";
import express from "express";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    res.json(await searchService.search(req.user!.user_id, req.query as Record<string, unknown>));
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
