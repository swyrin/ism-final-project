import express from "express";
import * as searchService from "@srv/services/searchService";

const router = express.Router();

router.get("/", (req, res) => {
    searchService.search(req.query as Record<string, unknown>, (status, data) => {
        res.status(status).json(data);
    });
});

export default router;
