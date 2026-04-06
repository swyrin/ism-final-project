import prisma from "@ism/prisma";
import * as fileService from "@srv/services/fileService";
import { HttpError } from "@srv/utils/HttpError";
import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

async function generateFileId(): Promise<string> {
  while (true) {
    const id = uuidv4();
    const existing = await prisma.file.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return id;
    }
  }
}

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

router.get("/:id", async (req, res) => {
  try {
    res.json(await fileService.getFileInformation(req.params.id));
  } catch (error) {
    if (error instanceof HttpError) res.status(error.status).json({ error: error.error });
    else {
      res.status(500).json({ error: "internal error." });
    }
  }
});

router.post(
  "/",
  upload.single("attachment"),
  async (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: "not upload any file." });
      return;
    }
    try {
      const fid = await generateFileId();
      const data = await fileService.createFile(req.body, fid, req.file.buffer, req.file.mimetype);
      res.status(200).json(data);
    } catch (error) {
      if (error instanceof HttpError) res.status(error.status).json({ message: error.message });
      else {
        res.status(500).json({ message: "internal error." });
      }
    }
  },
  (err: Error, _req: never, res: never, _next: never) => {
    (res as unknown as import("express").Response).status(400).json({ error: err.message });
  },
);

router.put("/:id", async (req, res) => {
  try {
    res.json(await fileService.editFileInformation(req.params.id, req.body));
  } catch (error) {
    if (error instanceof HttpError) res.status(error.status).json({ error: error.error });
    else {
      res.status(500).json({ error: "internal error." });
    }
  }
});

router.patch("/:id", async (req, res) => {
  try {
    res.json(await fileService.addView(req.params.id));
  } catch (error) {
    if (error instanceof HttpError) res.status(error.status).json({ error: error.error });
    else {
      res.status(500).json({ error: "internal error." });
    }
  }
});

router.delete("/:id", async (req, res) => {
  try {
    res.json(await fileService.deleteFile(req.params.id));
  } catch (error) {
    if (error instanceof HttpError) res.status(error.status).json({ error: error.error });
    else {
      res.status(500).json({ error: "internal error." });
    }
  }
});

export default router;
