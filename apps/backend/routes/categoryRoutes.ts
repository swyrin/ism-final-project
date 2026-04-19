import { requireAuth } from "@srv/middleware/middleware.auth";
import * as categoryService from "@srv/services/categoryService";
import { HttpError } from "@srv/utils/HttpError";
import express from "express";

const router = express.Router();

function handleError(err: unknown, res: express.Response) {
  if (err instanceof HttpError) {
    console.error("[HttpError]", {
      message: err.error,
      status: err.status,
      stack: err.stack,
    });

    res.status(err.status).json({ error: err.error });
  } else {
    console.error("[UnknownError]", err);

    res.status(500).json({ error: "internal error." });
  }
}

router.get("/", requireAuth, async (req, res) => {
  try {
    res.json(await categoryService.getCategory(req.user!.user_id));
  } catch (error) {
    handleError(error, res);
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    res.status(201).json(await categoryService.createCategory(req.user!.user_id, req.body));
  } catch (error) {
    handleError(error, res);
  }
});

router.delete("/", requireAuth, async (req, res) => {
  try {
    res.json(await categoryService.deleteCategory(req.user!.user_id, req.body));
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
