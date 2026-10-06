import express from "express";

import {
    createUser,
    getAllUsers,
    getUserById,
    updateUserStatus,
    updateUserRole,
} from "./user.controller.js";

import validate from "../../middleware/validation.middleware.js";
import { createUserSchema } from "./user.validator.js";
import authenticate from "../../middleware/auth.middleware.js";
import requirePermission from "../../middleware/permission.middleware.js";

const router = express.Router();

router.post(
    "/",
    authenticate,
    requirePermission("user:create"),
    validate(createUserSchema),
    createUser
);

router.get(
    "/",
    authenticate,
    requirePermission("user:read"),
    getAllUsers
);

router.get(
    "/:id",
    authenticate,
    requirePermission("user:read"),
    getUserById
);

router.put(
    "/:id/status",
    authenticate,
    requirePermission("user:update"),
    updateUserStatus
);

router.put(
    "/:id/role",
    authenticate,
    requirePermission("user:update"),
    updateUserRole
);

export default router;