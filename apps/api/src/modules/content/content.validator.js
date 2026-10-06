import Joi from "joi";

const createContentSchema = Joi.object({
    title: Joi.string()
        .trim()
        .min(3)
        .max(255)
        .required(),

    slug: Joi.string()
        .trim()
        .lowercase()
        .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .max(255)
        .required(),

    content_type: Joi.string()
        .valid(
            "ANNOUNCEMENT",
            "POLICY",
            "ARTICLE",
            "TECH_ARTICLE",
            "EVENT"
        )
        .required(),

    expires_at: Joi.date()
        .iso()
        .allow(null),
});

const updateContentSchema = Joi.object({
    title: Joi.string()
        .trim()
        .min(3)
        .max(255),

    slug: Joi.string()
        .trim()
        .lowercase()
        .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .max(255),

    content_type: Joi.string().valid(
        "ANNOUNCEMENT",
        "POLICY",
        "ARTICLE",
        "TECH_ARTICLE",
        "EVENT"
    ),

    expires_at: Joi.date()
        .iso()
        .allow(null),
}).min(1);

const editorBlockSchema = Joi.object({
    id: Joi.string().uuid().allow(null),

    block_type: Joi.string()
        .valid(
            "HEADING",
            "PARAGRAPH",
            "IMAGE",
            "VIDEO",
            "LIST",
            "TABLE",
            "QUOTE",
            "BUTTON",
            "DOCUMENT",
            "DIVIDER"
        )
        .required(),

    block_order: Joi.number()
        .integer()
        .min(1)
        .required(),

    content: Joi.object().required(),

    style: Joi.object().allow(null).default(null),
});

const editorSaveSchema = Joi.object({
    title: Joi.string()
        .trim()
        .min(3)
        .max(255)
        .required(),

    slug: Joi.string()
        .trim()
        .lowercase()
        .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .max(255)
        .required(),

    content_type: Joi.string()
        .valid(
            "ANNOUNCEMENT",
            "POLICY",
            "ARTICLE",
            "TECH_ARTICLE",
            "EVENT"
        )
        .required(),

    expires_at: Joi.date()
        .iso()
        .allow(null),

    blocks: Joi.array()
        .items(editorBlockSchema)
        .required(),
});

 const contentListQuerySchema = Joi.object({
    search: Joi.string()
        .trim()
        .max(100)
        .optional(),

    content_type: Joi.string()
        .valid(
            "ANNOUNCEMENT",
            "POLICY",
            "ARTICLE",
            "TECH_ARTICLE",
            "EVENT"
        )
        .optional(),

    status: Joi.string()
        .trim()
        .optional(),

    author_id: Joi.string()
        .uuid()
        .optional(),

    page: Joi.number()
        .integer()
        .min(1)
        .default(1),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10),

    sort: Joi.string()
        .valid(
            "created_at",
            "updated_at",
            "title",
            "published_at"
        )
        .default("created_at"),

    order: Joi.string()
        .valid("ASC", "DESC")
        .default("DESC"),
});

export {
    createContentSchema,
    updateContentSchema,
    editorSaveSchema,
    contentListQuerySchema,
};