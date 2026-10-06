import Joi from "joi";

const createCategorySchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required(),

    slug: Joi.string()
        .trim()
        .lowercase()
        .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .max(120)
        .required(),

    description: Joi.string()
        .trim()
        .max(500)
        .allow(null, ""),

    parent_id: Joi.string()
        .uuid()
        .allow(null),

    is_active: Joi.boolean().default(true),
});

const updateCategorySchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(100),

    slug: Joi.string()
        .trim()
        .lowercase()
        .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .max(120),

    description: Joi.string()
        .trim()
        .max(500)
        .allow(null, ""),

    parent_id: Joi.string()
        .uuid()
        .allow(null),

    is_active: Joi.boolean(),
}).min(1);

 const assignCategoriesSchema = Joi.object({
    category_ids: Joi.array()
        .items(Joi.string().uuid())
        .unique()
        .required(),
});


export {
    createCategorySchema,
    updateCategorySchema,
    assignCategoriesSchema,
};