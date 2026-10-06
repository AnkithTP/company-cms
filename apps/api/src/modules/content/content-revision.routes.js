import express from "express";

import {
    createRevision,
    getRevisions,
    getRevisionById,
    restoreRevision,
} from "./content-revision.controller.js";

import authenticate from "../../middleware/auth.middleware.js";
import requirePermission from "../../middleware/permission.middleware.js";

const router = express.Router();

router.post(
    "/:contentId/revisions",
    authenticate,
    requirePermission("content:update"),
    createRevision
);

router.get(
    "/:contentId/revisions",
    authenticate,
    requirePermission("content:read"),
    getRevisions
);

router.get(
    "/:contentId/revisions/:revisionId",
    authenticate,
    requirePermission("content:read"),
    getRevisionById
);

router.post(
    "/:contentId/revisions/:revisionId/restore",
    authenticate,
    requirePermission("content:update"),
    restoreRevision
);

export default router;