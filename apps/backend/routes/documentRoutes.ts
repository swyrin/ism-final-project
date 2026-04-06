import express from "express";
import * as documentService from "@srv/services/documentService";

const router = express.Router();

router.get("/", (req, res) => {
    documentService.getDocument(req.query as Record<string, unknown>, (status, data) => {
        res.status(status).json(data);
    });
});

router.post("/", (req, res) => {
    documentService.createDocument(req.body, (status, data) => {
        res.status(status).json(data);
    });
});

router.put("/", (req, res) => {
    documentService.changeDocumentName(req.body, (status, data) => {
        res.status(status).json(data);
    });
});

router.delete("/", (req, res) => {
    documentService.deleteDocument(req.body, (status, data) => {
        res.status(status).json(data);
    });
});

export default router;
