import express from "express";

import upload from "../../middleware/upload.middleware.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/permission.middleware.js";

import {
    uploadMedia,
    getAllMedia,
    getMediaById,
    deleteMedia,
} from "./media.controller.js";

const router = express.Router();

router.post(
    "/",
    authenticate,
    requirePermission("media:upload"),
    upload.single("file"),
    uploadMedia
);

router.get(
    "/",
    authenticate,
    requirePermission("content:read"),
    getAllMedia
);

router.get(
    "/:id",
    authenticate,
    requirePermission("content:read"),
    getMediaById
);

router.delete(
    "/:id",
    authenticate,
    requirePermission("content:delete"),
    deleteMedia
);

export default router;