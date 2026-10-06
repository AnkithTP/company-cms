import express from "express";

import { authenticate }
    from "../../middleware/auth.middleware.js";

import { requirePermission }
    from "../../middleware/permission.middleware.js";

import { validate }
    from "../../middleware/validation.middleware.js";

import {
    createEventSchema,
    updateEventSchema,
} from "./event.validator.js";

import {
    createEvent,
    getEvent,
    updateEvent,
    deleteEvent,
} from "./event.controller.js";

const router = express.Router();

router.post(
    "/:contentId/event",
    authenticate,
    requirePermission("content:create"),
    validate(createEventSchema),
    createEvent
);

router.get(
    "/:contentId/event",
    authenticate,
    requirePermission("content:read"),
    getEvent
);

router.put(
    "/:contentId/event",
    authenticate,
    requirePermission("content:update"),
    validate(updateEventSchema),
    updateEvent
);

router.delete(
    "/:contentId/event",
    authenticate,
    requirePermission("content:delete"),
    deleteEvent
);

export default router;