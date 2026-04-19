import { requireAuth } from "@srv/middleware/middleware.auth";
import * as homeService from "@srv/services/homeService";
import express from "express";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    res.json(await homeService.getAllDocuments(req.user!.user_id));
  } catch {
    res.status(500).json({ error: "internal error." });
  }
});

export default router;
