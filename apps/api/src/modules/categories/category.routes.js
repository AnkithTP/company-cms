import express from "express";

import {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
} from "./category.controller.js";

import validate
    from "../../middleware/validation.middleware.js";

import authenticate
    from "../../middleware/auth.middleware.js";

import requirePermission
    from "../../middleware/permission.middleware.js";

import {
    createCategorySchema,
    updateCategorySchema,
} from "./category.validator.js";

const router = express.Router();

router.post(
    "/",
    authenticate,
    requirePermission("content:create"),
    validate(createCategorySchema),
    createCategory
);

router.get(
    "/",
    authenticate,
    requirePermission("content:read"),
    getAllCategories
);

router.get(
    "/:id",
    authenticate,
    requirePermission("content:read"),
    getCategoryById
);

router.put(
    "/:id",
    authenticate,
    requirePermission("content:update"),
    validate(updateCategorySchema),
    updateCategory
);

router.delete(
    "/:id",
    authenticate,
    requirePermission("content:delete"),
    deleteCategory
);

export default router;