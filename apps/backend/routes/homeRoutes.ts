import * as homeService from "@srv/services/homeService";
import express from "express";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    res.json(await homeService.getAllDocuments());
  } catch {
    res.status(500).json({ error: "internal error." });
  }
});

export default router;
