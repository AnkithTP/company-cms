import { Content, User, Category, EventDetail } from "../../database/models.js";
import {
    Op,
} from "sequelize";


const create = async (contentData) => {
    return await Content.create(contentData);
};

const findAll = async () => {
    return await Content.findAll({
        include: [
            {
                model: User,
                as: "author",
                attributes: [
                    "id",
                    "employee_code",
                    "first_name",
                    "last_name",
                    "email",
                ],
            },
            {
                model: Category,
                as: "categories",
                attributes: ["id", "name", "slug"],
                through: { attributes: [] },
            },
            {
                model: EventDetail,
                as: "eventDetails",
                required: false,
            },
        ],
        order: [["created_at", "DESC"]],
    });
};

const findById = async (
    id,
    transaction = null
) => {
    return await Content.findByPk(id, {
        include: [
            {
                model: User,
                as: "author",
                attributes: [
                    "id",
                    "employee_code",
                    "first_name",
                    "last_name",
                ],
            },
            {
                model: Category,
                as: "categories",
                attributes: ["id", "name", "slug"],
                through: { attributes: [] },
            },
            {
                model: EventDetail,
                as: "eventDetails",
                required: false,
            },
        ],
        transaction,
    });
};

const findBySlug = async (
    slug,
    transaction = null
) => {
    return await Content.findOne({
        where: { slug },
        transaction,
    });
};

const update = async (
    id,
    contentData,
    transaction = null
) => {
    const [updatedRows] = await Content.update(
        contentData,
        {
            where: { id },
            transaction,
        }
    );

    if (updatedRows === 0) {
        return null;
    }

    return await Content.findByPk(id, {
        transaction,
    });
};

export const findAllWithFilters = async ({
    search,
    content_type,
    status,
    author_id,
    page = 1,
    limit = 10,
    sort = "created_at",
    order = "DESC",
}) => {
    const where = {};

    /*
     * Search by title
     */
    if (search) {
        where.title = {
            [Op.iLike]: `%${search}%`,
        };
    }

    /*
     * Filter by content type
     */
    if (content_type) {
        where.content_type = content_type;
    }

    /*
     * Filter by status
     */
    if (status) {
        if (typeof status === "string" && status.includes(",")) {
            where.status = {
                [Op.in]: status.split(",").map((s) => s.trim()),
            };
        } else if (Array.isArray(status)) {
            where.status = {
                [Op.in]: status,
            };
        } else {
            where.status = status;
        }
    }

    /*
     * Filter by author
     */
    if (author_id) {
        where.author_id = author_id;
    }

    /*
     * Pagination
     */
    const offset = (page - 1) * limit;

    /*
     * Sorting
     *
     * Whitelist allowed columns.
     */
    const allowedSortFields = [
        "created_at",
        "updated_at",
        "title",
        "published_at",
    ];

    const safeSort = allowedSortFields.includes(sort)
        ? sort
        : "created_at";

    const safeOrder =
        order.toUpperCase() === "ASC"
            ? "ASC"
            : "DESC";

    const { count, rows } =
        await Content.findAndCountAll({
            where,

            include: [
                {
                    model: User,
                    as: "author",
                    attributes: [
                        "id",
                        "employee_code",
                        "first_name",
                        "last_name",
                        "email",
                    ],
                },
            ],

            limit,
            offset,

            order: [
                [safeSort, safeOrder],
            ],

            distinct: true,
        });

    return {
        rows,
        count,
    };
};

export {
    create,
    findAll,
    findById,
    findBySlug,
    update 
};