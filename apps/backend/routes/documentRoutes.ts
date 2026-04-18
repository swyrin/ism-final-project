import { requireAuth } from "@srv/middleware/middleware.auth";
import * as documentService from "@srv/services/documentService";
import * as fileService from "@srv/services/fileService";
import { handleError } from "@srv/utils/HttpError";
import express from "express";

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    res.json(await documentService.getDocument(req.user!.user_id, req.query as Record<string, unknown>));
  } catch (error) {
    handleError(error, res);
  }
});

router.get(
  "/:document_id",
  requireAuth,
  async (req: express.Request<{ document_id: string }>, res: express.Response) => {
    try {
      const { document_id } = req.params;
      const { category_id } = req.query;
      res.json(
        await fileService.getFilesByDocumentId(
          req.user!.user_id,
          document_id,
          category_id as string | undefined,
        ),
      );
    } catch (error) {
      handleError(error, res);
    }
  },
);

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
