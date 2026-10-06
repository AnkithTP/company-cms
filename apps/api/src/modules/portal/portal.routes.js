import express from "express";

import {
    authenticate,
} from "../../middleware/auth.middleware.js";

import {
    getPortalContents,
    getPortalContentBySlug,
} from "./portal.controller.js";

const router = express.Router();

router.get(
    "/contents",
    authenticate,
    getPortalContents
);

router.get(
    "/contents/:slug",
    authenticate,
    getPortalContentBySlug
);

export default router;