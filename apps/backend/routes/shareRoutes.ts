import * as minioService from "@srv/infra/storage/minioService";
import { requireAuth } from "@srv/middleware/middleware.auth";
import * as shareService from "@srv/services/shareService";
import { handleError } from "@srv/utils/HttpError";
import express from "express";

const router = express.Router();

// PATCH /share/:id/revoke — owner only, soft-deletes the share
router.patch(
  "/:id/revoke",
  requireAuth,
  async (req: express.Request<{ id: string }>, res: express.Response) => {
    try {
      await shareService.revokeShare(req.user!.user_id, req.params.id);
      res.status(204).end();
    } catch (error) {
      handleError(error, res);
    }
  },
);

// GET /share/:id/info — PUBLIC. Returns metadata only (no bytes).
router.get("/:id/info", async (req: express.Request<{ id: string }>, res: express.Response) => {
  try {
    const info = await shareService.getShareInfo(req.params.id);
    res.json(info);
  } catch (error) {
    handleError(error, res);
  }
});

// GET /share/:id — PUBLIC. Streams the file bytes if the share is active.
router.get("/:id", async (req: express.Request<{ id: string }>, res: express.Response) => {
  try {
    const share = await shareService.getActiveShareForView(req.params.id);
    if (!share) {
      res.status(404).json({ error: "share not found or revoked." });
      return;
    }
    const stream = await minioService.getObjectStream(share.file.storagePath);
    if (stream.contentType) res.setHeader("Content-Type", stream.contentType);
    if (stream.contentLength) res.setHeader("Content-Length", String(stream.contentLength));
    res.setHeader("Content-Disposition", "inline");
    stream.body.pipe(res);
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
