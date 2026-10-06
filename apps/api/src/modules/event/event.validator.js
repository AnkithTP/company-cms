import Joi from "joi";

export const createEventSchema = Joi.object({
    event_date: Joi.date()
        .iso()
        .required(),

    start_time: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
        .required(),

    end_time: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/)
        .allow(null, "")
        .optional(),

    location: Joi.string()
        .max(500)
        .allow(null, "")
        .optional(),

    meeting_url: Joi.string()
        .uri()
        .max(1000)
        .allow(null, "")
        .optional(),

    organizer: Joi.string()
        .max(255)
        .allow(null, "")
        .optional(),

    registration_url: Joi.string()
        .uri()
        .max(1000)
        .allow(null, "")
        .optional(),
});

export const updateEventSchema =
    createEventSchema.fork(
        [
            "event_date",
            "start_time",
            "end_time",
            "location",
            "meeting_url",
            "organizer",
            "registration_url",
        ],
        (schema) => schema.optional()
    );