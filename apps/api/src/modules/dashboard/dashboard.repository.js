import {
    Content,
    EventDetail,
    AuditLog,
} from "../../database/models.js";

import { Op } from "sequelize";
import sequelize from "../../config/database.js";

export const getContentStatusCounts = async () => {
    const result = await Content.findAll({
        attributes: [
            "status",
            [
                sequelize.fn(
                    "COUNT",
                    sequelize.col("id")
                ),
                "count",
            ],
        ],

        group: ["status"],

        raw: true,
    });

    return result;
};

export const getContentTypeCounts = async () => {
    return Content.findAll({
        attributes: [
            "content_type",
            [
                sequelize.fn(
                    "COUNT",
                    sequelize.col("id")
                ),
                "count",
            ],
        ],

        group: ["content_type"],

        raw: true,
    });
};

export const getTotalContentCount = async () => {
    return Content.count();
};

export const getUpcomingEvents = async (
    limit = 5
) => {
    return EventDetail.findAll({
        where: {
            event_date: {
                [Op.gte]: new Date(),
            },
        },

        include: [
            {
                model: Content,
                as: "content",

                where: {
                    status: "PUBLISHED",
                    content_type: "EVENT",
                },

                attributes: [
                    "id",
                    "title",
                    "slug",
                    "published_at",
                ],
            },
        ],

        order: [
            ["event_date", "ASC"],
            ["start_time", "ASC"],
        ],

        limit,
    });
};

export const getRecentAuditLogs = async (
    limit = 10
) => {
    return AuditLog.findAll({
        include: [
            {
                association: "user",
                attributes: [
                    "id",
                    "first_name",
                    "last_name",
                    "email",
                ],
            },
        ],

        order: [
            ["created_at", "DESC"],
        ],

        limit,
    });
};



