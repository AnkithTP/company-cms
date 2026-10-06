import express from "express";

import { authenticate } from "../../middleware/auth.middleware.js";
import { requirePermission } from "../../middleware/permission.middleware.js";

import { validate } from "../../middleware/validation.middleware.js";

import {
    assignCategoriesSchema,
} from "./category.validator.js";

import {
    assignCategories,
} from "./content-category.controller.js";

const router = express.Router();

router.put(
    "/:contentId/categories",
    authenticate,
    requirePermission("content:update"),
    validate(assignCategoriesSchema),
    assignCategories
);

export default router;