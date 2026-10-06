import {
    Op,
} from "sequelize";

import {
    Content,
    User,
    ContentBlock,
    Category,
    EventDetail,
} from "../../database/models.js";

export const findPublishedContents = async ({
    search,
    content_type,
    category_id,
    page = 1,
    limit = 10,
}) => {
    const where = {
        status: "PUBLISHED",
    };

    if (search) {
        where.title = {
            [Op.iLike]: `%${search}%`,
        };
    }

    if (content_type) {
        where.content_type = content_type;
    }

    const offset = (page - 1) * limit;

    const { count, rows } =
        await Content.findAndCountAll({
            where,

            include: [
                {
                    model: User,
                    as: "author",
                    attributes: [
                        "id",
                        "first_name",
                        "last_name",
                    ],
                },

                {
                    model: ContentBlock,
                    as: "blocks",
                    separate: true,
                    order: [
                        ["block_order", "ASC"],
                    ],
                },

                {
                    model: Category,
                    as: "categories",
                    attributes: [
                        "id",
                        "name",
                        "slug",
                    ],

                    ...(category_id
                        ? {
                            where: {
                                id: category_id,
                            },
                        }
                        : {}),
                },

                {
                    model: EventDetail,
                    as: "eventDetails",
                    required: false,
                },
            ],

            limit,
            offset,

            order: [
                ["published_at", "DESC"],
            ],

            distinct: true,
        });

    return {
        rows,
        count,
    };
};

export const findPublishedBySlug = async (
    slug
) => {
    return Content.findOne({
        where: {
            slug,
            status: "PUBLISHED",
        },

        include: [
            {
                model: User,
                as: "author",
                attributes: [
                    "id",
                    "first_name",
                    "last_name",
                ],
            },

            {
                model: ContentBlock,
                as: "blocks",
                separate: true,
                order: [
                    ["block_order", "ASC"],
                ],
            },

            {
                model: Category,
                as: "categories",
                attributes: [
                    "id",
                    "name",
                    "slug",
                ],
            },

            {
                model: EventDetail,
                as: "eventDetails",
                required: false,
            },
        ],
    });
};