const validate = (schema, source = "body") => {
    return (req, res, next) => {
        const data = req[source] || {};
        const { error, value } = schema.validate(data, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const validationError = new Error("Validation failed");

            validationError.statusCode = 400;

            validationError.details = error.details.map((detail) => ({
                field: detail.path.join("."),
                message: detail.message,
            }));

            return next(validationError);
        }

        try {
            req[source] = value;
        } catch {
            try {
                Object.defineProperty(req, source, {
                    value,
                    writable: true,
                    enumerable: true,
                    configurable: true,
                });
            } catch {
                if (req[source] && typeof req[source] === "object") {
                    Object.keys(req[source]).forEach((k) => delete req[source][k]);
                    Object.assign(req[source], value);
                }
            }
        }

        next();
    };
};

export { validate };
export default validate;