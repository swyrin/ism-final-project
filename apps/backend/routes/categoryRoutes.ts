import express from "express";
import * as categoryService from "@srv/services/categoryService";

const router = express.Router();

router.get("/", (_req, res) => {
    categoryService.getCategory((status, data) => {
        res.status(status).json(data);
    });
});

router.post("/", (req, res) => {
    categoryService.createCategory(req.body, (status, data) => {
        res.status(status).json(data);
    });
});

router.delete("/", (req, res) => {
    categoryService.deleteCategory(req.body, (status, data) => {
        res.status(status).json(data);
    });
});

export default router;
