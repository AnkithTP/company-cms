import Joi from "joi";

const createContentBlockSchema = Joi.object({
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

    content: Joi.object()
        .required(),

    style: Joi.object()
        .allow(null)
        .default(null),
});

const updateContentBlockSchema = Joi.object({
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
        ),

    block_order: Joi.number()
        .integer()
        .min(1),

    content: Joi.object(),

    style: Joi.object()
        .allow(null),
}).min(1);

const reorderContentBlocksSchema = Joi.object({
    block_ids: Joi.array()
        .items(Joi.string().uuid())
        .min(1)
        .required(),
});

export {
    createContentBlockSchema,
    updateContentBlockSchema,
    reorderContentBlocksSchema,
};