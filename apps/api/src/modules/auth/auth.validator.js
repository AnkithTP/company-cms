import Joi from "joi";

const loginSchema = Joi.object({
    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .max(255)
        .required(),

    password: Joi.string()
        .min(8)
        .max(128)
        .required(),
});


const registerSchema = Joi.object({
    employee_code: Joi.string()
        .trim()
        .max(50)
        .required(),

    first_name: Joi.string()
        .trim()
        .max(100)
        .required(),

    last_name: Joi.string()
        .trim()
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

    role: Joi.string()
        .trim()
        .max(50)
        .optional(),
});

export {
    loginSchema,
    registerSchema,
};