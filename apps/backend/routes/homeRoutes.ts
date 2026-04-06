import express from "express";
import * as homeService from "@srv/services/homeService";

const router = express.Router();

router.get("/", (_req, res) => {
    homeService.getAllDocuments((status, data) => {
        res.status(status).json(data);
    });
});

export default router;
