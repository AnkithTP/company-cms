import Joi from "joi";

const createUserSchema = Joi.object({
    employee_code: Joi.string()
        .trim()
        .max(50)
        .required(),

    first_name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required(),

    last_name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required(),

    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .max(255)
        .required(),

    password: Joi.string()
        .min(8)
        .max(100)
        .required(),

    is_active: Joi.boolean()
        .default(true),
});

export {
    createUserSchema,
};