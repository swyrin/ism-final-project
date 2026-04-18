import * as minioService from "@srv/infra/storage/minioService";
import { requireAuth } from "@srv/middleware/middleware.auth";
import * as fileService from "@srv/services/fileService";
import * as shareService from "@srv/services/shareService";
import { handleError } from "@srv/utils/HttpError";
import express from "express";
import multer from "multer";
const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("allow PDF file only."));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.get("/:id", requireAuth, async (req: express.Request<{ id: string }>, res: express.Response) => {
  try {
    res.json(await fileService.getFileInformation(req.user!.user_id, req.params.id));
  } catch (error) {
    handleError(error, res);
  }
});

router.get(
  "/:id/raw",
  requireAuth,
  async (
    req: express.Request<{ id: string }, unknown, unknown, { download?: string }>,
    res: express.Response,
  ) => {
    try {
      const file = await fileService.getFileForStream(req.user!.user_id, req.params.id);
      const stream = await minioService.getObjectStream(file.storagePath);
      res.setHeader("Content-Type", stream.contentType ?? "application/pdf");
      if (stream.contentLength) res.setHeader("Content-Length", String(stream.contentLength));
      const disposition = req.query.download === "1" ? "attachment" : "inline";
      const safeName = encodeURIComponent(`${file.title}.pdf`);
      res.setHeader("Content-Disposition", `${disposition}; filename*=UTF-8''${safeName}`);
      stream.body.pipe(res);
    } catch (error) {
      handleError(error, res);
    }
  },
);

router.post(
  "/",
  requireAuth,
  upload.single("attachment"),
  async (req: express.Request, res: express.Response) => {
    if (!req.file) {
      res.status(400).json({ error: "not upload any file." });
      return;
    }
    try {
      const data = await fileService.createFile(
        req.user!.user_id,
        req.body,
        req.file.buffer,
        req.file.mimetype,
      );
      res.status(200).json(data);
    } catch (error) {
      handleError(error, res);
    }
  },
);
// Create a share link for one of the user's files
router.post(
  "/:file_id/share",
  requireAuth,
  async (req: express.Request<{ file_id: string }>, res: express.Response) => {
    try {
      const data = await shareService.createShare(req.user!.user_id, req.params.file_id);
      res.status(200).json(data);
    } catch (error) {
      handleError(error, res);
    }
  },
);

// List active shares for one of the user's files
router.get(
  "/:file_id/shares",
  requireAuth,
  async (req: express.Request<{ file_id: string }>, res: express.Response) => {
    try {
      const data = await shareService.listShares(req.user!.user_id, req.params.file_id);
      res.json(data);
    } catch (error) {
      handleError(error, res);
    }
  },
);
router.put("/:id", requireAuth, async (req: express.Request<{ id: string }>, res: express.Response) => {
  try {
    res.json(await fileService.editFileInformation(req.user!.user_id, req.params.id, req.body));
  } catch (error) {
    handleError(error, res);
  }
});

router.patch("/:id", requireAuth, async (req: express.Request<{ id: string }>, res: express.Response) => {
  try {
    res.json(await fileService.addView(req.user!.user_id, req.params.id));
  } catch (error) {
    handleError(error, res);
  }
});

router.delete("/:id", requireAuth, async (req: express.Request<{ id: string }>, res: express.Response) => {
  try {
    res.json(await fileService.deleteFile(req.user!.user_id, req.params.id));
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
