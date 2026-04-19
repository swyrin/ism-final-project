import { requireAuth } from "@srv/middleware/middleware.auth";
import * as homeService from "@srv/services/homeService";
import { handleError } from "@srv/utils/HttpError";
import express from "express";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    res.json(await homeService.getAllDocuments(req.user!.user_id));
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
