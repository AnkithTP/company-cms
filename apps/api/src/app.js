import express from "express";
import cors from "cors";
import path from "path";

import userRoutes from "./modules/users/user.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import contentRoutes from "./modules/content/content.routes.js";
import contentBlockRoutes from "./modules/content/content-block.routes.js";
import contentRevisionRoutes from "./modules/content/content-revision.routes.js";
import categoryRoutes
    from "./modules/categories/category.routes.js";

import errorMiddleware from "./middleware/error.middleware.js";

import contentWorkflowRoutes
    from "./modules/content/content-workflow.routes.js";

import mediaRoutes from "./modules/media/media.routes.js";

import contentCategoryRoutes from "./modules/categories/content-category.routes.js";
import eventRoutes from "./modules/event/event.routes.js";
import portalRoutes
    from "./modules/portal/portal.routes.js";

import dashboardRoutes
    from "./modules/dashboard/dashboard.routes.js";

import notificationRoutes
    from "./modules/notification/notification.routes.js";

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://company-cms-75c35.web.app",
    "https://company-cms-75c35.firebaseapp.com",
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : [])
].filter(Boolean);

const isOriginAllowed = (origin) => {
    if (!origin) return true;
    const cleanOrigin = origin.replace(/\/+$/, "").toLowerCase();
    return (
        allowedOrigins.some(
            (o) => o.replace(/\/+$/, "").toLowerCase() === cleanOrigin
        ) ||
        cleanOrigin.endsWith(".web.app") ||
        cleanOrigin.endsWith(".firebaseapp.com") ||
        process.env.NODE_ENV !== "production"
    );
};

// 1. Explicit preflight & CORS header middleware (guarantees headers even before error middleware)
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && isOriginAllowed(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD"
        );
        res.setHeader(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
        );
        res.setHeader("Access-Control-Max-Age", "86400");
    }

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
    next();
});

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || isOriginAllowed(origin)) {
            return callback(null, true);
        }
        console.warn("Blocked CORS origin:", origin);
        return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers"
    ],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Company CMS API is running",
    });
});

app.use("/api/v1/users", userRoutes);

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/contents", contentRoutes);
app.use("/api/v1/contents", contentBlockRoutes);
app.use(
    "/api/v1/contents",
    contentRevisionRoutes
);

app.use(
    "/api/v1/contents",
    contentWorkflowRoutes
);

app.use(
    "/api/v1/categories",
    categoryRoutes
);

app.use(
    "/api/v1/contents",
    contentCategoryRoutes
);

app.use("/api/v1/media", mediaRoutes);
app.use("/uploads",express.static(path.join(process.cwd(), "uploads")));
app.use(
    "/api/v1/contents",
    eventRoutes
);

app.use(
    "/api/v1/portal",
    portalRoutes
);

app.use(
    "/api/v1/dashboard",
    dashboardRoutes
);

app.use(
    "/api/v1/notifications",
    notificationRoutes
);


app.use(errorMiddleware);

export default app;