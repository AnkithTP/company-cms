import express from "express";

import {
    createBlock,
    getBlocks,
    updateBlock,
    deleteBlock,
    reorderBlocks
} from "./content-block.controller.js";

import validate from "../../middleware/validation.middleware.js";
import authenticate from "../../middleware/auth.middleware.js";
import requirePermission from "../../middleware/permission.middleware.js";

import {
    createContentBlockSchema,
    updateContentBlockSchema,
    reorderContentBlocksSchema
} from "./content-block.validator.js";

const router = express.Router();

router.post(
    "/:contentId/blocks",
    authenticate,
    requirePermission("content:update"),
    validate(createContentBlockSchema),
    createBlock
);

router.get(
    "/:contentId/blocks",
    authenticate,
    requirePermission("content:read"),
    getBlocks
);

router.put(
    "/:contentId/blocks/:blockId",
    authenticate,
    requirePermission("content:update"),
    validate(updateContentBlockSchema),
    updateBlock
);

router.delete(
    "/:contentId/blocks/:blockId",
    authenticate,
    requirePermission("content:update"),
    deleteBlock
);

router.put(
    "/:contentId/blocks/reorder",
    authenticate,
    requirePermission("content:update"),
    validate(reorderContentBlocksSchema),
    reorderBlocks
);

export default router;