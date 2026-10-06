import express from "express";

import { authenticate }
    from "../../middleware/auth.middleware.js";

import {
    getNotifications,
    getUnreadNotifications,
    markAsRead,
} from "./notification.controller.js";

const router = express.Router();

router.get(
    "/",
    authenticate,
    getNotifications
);

router.get(
    "/unread",
    authenticate,
    getUnreadNotifications
);

router.patch(
    "/:id/read",
    authenticate,
    markAsRead
);

export default router;