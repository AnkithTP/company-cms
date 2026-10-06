import express from "express";

import { authenticate }
    from "../../middleware/auth.middleware.js";

import { requirePermission }
    from "../../middleware/permission.middleware.js";

import {
    getDashboardSummary,
} from "./dashboard.controller.js";

const router = express.Router();

router.get(
    "/summary",
    authenticate,
    requirePermission("content:read"),
    getDashboardSummary
);

export default router;