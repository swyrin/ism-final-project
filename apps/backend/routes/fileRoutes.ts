import express from "express";
import * as fileService from "@srv/services/fileService";
import upload from "@srv/utils/multerConfig";

const router = express.Router();

router.get("/", (req, res) => {
    const { id, detail, download } = req.query as Record<string, string | undefined>;

    if (!id) {
        res.status(400).json({ message: "missing parameter." });
        return;
    }

    if (!detail) {
        fileService.getFile(id, (status, data) => {
            if (status === 200) {
                const { filePath, fileName } = data as { filePath: string; fileName: string };

                if (download) {
                    res.download(filePath, fileName, (err) => {
                        if (err) res.status(404).json({ message: "file not found." });
                    });
                } else {
                    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
                    res.sendFile(filePath, (err) => {
                        if (err) res.status(404).json({ message: "file not found." });
                    });
                }
            } else {
                res.status(404).json({ message: "file not found." });
            }
        });
    } else {
        fileService.getFileInformation(id, (status, data) => {
            res.status(status).json(data);
        });
    }
});

router.post(
    "/",
    upload.single("attachment"),
    (req, res) => {
        if (!req.file) {
            res.status(400).json({ message: "not upload any file." });
            return;
        }

        fileService.createFile(req.body, req.savedFileId!, (status, data) => {
            res.status(status).json(data);
        });
    },
    (err: Error, _req: never, res: never, _next: never) => {
        (res as unknown as import("express").Response).status(400).json({ message: err.message });
    }
);

router.put("/", (req, res) => {
    fileService.editFileInformation(req.body, (status, data) => {
        res.status(status).json(data);
    });
});

router.patch("/", (req, res) => {
    fileService.addView(req.body, (status, data) => {
        res.status(status).json(data);
    });
});

router.delete("/", (req, res) => {
    fileService.deleteFile(req.body, (status, data) => {
        res.status(status).json(data);
    });
});

export default router;
