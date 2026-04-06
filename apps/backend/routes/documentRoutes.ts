import * as documentService from "@srv/services/documentService";
import { HttpError } from "@srv/utils/HttpError";
import express from "express";

const router = express.Router();

function handleError(err: unknown, res: express.Response) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.error });
  } else {
    res.status(500).json({ error: "internal error." });
  }
}

router.get("/", async (req, res) => {
  try {
    res.json(await documentService.getDocument(req.query as Record<string, unknown>));
  } catch (error) {
    handleError(error, res);
  }
});

router.post("/", async (req, res) => {
  try {
    res.status(201).json(await documentService.createDocument(req.body));
  } catch (error) {
    handleError(error, res);
  }
});

router.put("/", async (req, res) => {
  try {
    res.status(201).json(await documentService.changeDocumentName(req.body));
  } catch (error) {
    handleError(error, res);
  }
});

router.delete("/", async (req, res) => {
  try {
    res.json(await documentService.deleteDocument(req.body));
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
