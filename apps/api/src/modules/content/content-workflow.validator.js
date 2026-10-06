import Joi from "joi";

export const rejectContentSchema = Joi.object({
    reason: Joi.string()
        .trim()
        .min(5)
        .max(1000)
        .required()
});

