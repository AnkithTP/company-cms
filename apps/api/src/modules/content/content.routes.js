import express from "express";

import {
    createContent,
    getContents,
    getContentById,
    updateContent,
    saveEditorContent

} from "./content.controller.js";

import validate from "../../middleware/validation.middleware.js";
import authenticate from "../../middleware/auth.middleware.js";
import requirePermission from "../../middleware/permission.middleware.js";
import {updateContentSchema} from "../../modules/content/content.validator.js";
import {editorSaveSchema} from "../../modules/content/content.validator.js"
import { createContentSchema } from "./content.validator.js";
import {
    contentListQuerySchema,
} from "./content.validator.js";

const router = express.Router();

router.post(
    "/",
    authenticate,
    requirePermission("content:create"),
    validate(createContentSchema),
    createContent
);

router.get(
    "/",
    authenticate,
    requirePermission("content:read"),
    validate(contentListQuerySchema, "query"),
    getContents
);

router.get(
    "/:id",
    authenticate,
    requirePermission("content:read"),
    getContentById
);

router.put(
    "/:id",
    authenticate,
    requirePermission("content:update"),
    validate(updateContentSchema),
    updateContent
);

router.put(
    "/:id/editor",
    authenticate,
    requirePermission("content:update"),
    validate(editorSaveSchema),
    saveEditorContent
);

export default router;