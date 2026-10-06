import express from "express";

import { login, register, getMe, getRoles } from "./auth.controller.js";
import validate from "../../middleware/validation.middleware.js";
import authenticate from "../../middleware/auth.middleware.js";
import { loginSchema, registerSchema } from "./auth.validator.js";

const router = express.Router();

router.post(
    "/register",
    validate(registerSchema),
    register
);

router.post(
    "/login",
    validate(loginSchema),
    login
);

router.get(
    "/me",
    authenticate,
    getMe
);

router.get(
    "/roles",
    getRoles
);

export default router;