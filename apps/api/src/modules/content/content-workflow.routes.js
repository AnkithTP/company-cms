import express from "express";

import {
    submitContent,
    startReview,
    approveContent,
    rejectContent,
    publishContent,
    archiveContent,
} from "./content-workflow.controller.js";

import authenticate
    from "../../middleware/auth.middleware.js";

import requirePermission
    from "../../middleware/permission.middleware.js";
import validate from "../../middleware/validation.middleware.js";
import { rejectContentSchema } from "./content-workflow.validator.js";

const router = express.Router();

router.post(
    "/:id/submit",
    authenticate,
    requirePermission("content:update"),
    submitContent
);

router.post(
    "/:id/start-review",
    authenticate,
    requirePermission("content:update"),
    startReview
);

router.post(
    "/:id/approve",
    authenticate,
    requirePermission("content:publish"),
    approveContent
);

router.post(
    "/:id/reject",
    authenticate,
    requirePermission("content:publish"),
    validate(rejectContentSchema),
    rejectContent
);

router.post(
    "/:id/publish",
    authenticate,
    requirePermission("content:publish"),
    publishContent
);

router.post(
    "/:id/archive",
    authenticate,
    requirePermission("content:publish"),
    archiveContent
);

export default router;