import sequelize from "../../config/database.js";

import * as eventRepository
    from "./event.repository.js";

import * as contentRepository
    from "../content/content.repository.js";

export const createEvent = async (
    contentId,
    eventData
) => {
    return sequelize.transaction(
        async (transaction) => {

            const content =
                await contentRepository.findById(
                    contentId,
                    transaction
                );

            if (!content) {
                const error =
                    new Error("Content not found");

                error.statusCode = 404;
                throw error;
            }

            if (content.content_type !== "EVENT") {
                const error =
                    new Error(
                        "Event details can only be created for EVENT content"
                    );

                error.statusCode = 400;
                throw error;
            }

            const existingEvent =
                await eventRepository.findByContentId(
                    contentId,
                    transaction
                );

            if (existingEvent) {
                const error =
                    new Error(
                        "Event details already exist for this content"
                    );

                error.statusCode = 409;
                throw error;
            }

            if (
                eventData.end_time &&
                eventData.end_time <= eventData.start_time
            ) {
                const error =
                    new Error(
                        "End time must be after start time"
                    );

                error.statusCode = 400;
                throw error;
            }

            return eventRepository.create(
                {
                    content_id: contentId,
                    ...eventData,
                },
                transaction
            );
        }
    );
};

export const getEvent = async (
    contentId
) => {
    const event =
        await eventRepository.findByContentId(
            contentId
        );

    if (!event) {
        const error =
            new Error("Event details not found");

        error.statusCode = 404;
        throw error;
    }

    return event;
};

export const updateEvent = async (
    contentId,
    eventData
) => {
    return sequelize.transaction(
        async (transaction) => {

            const event =
                await eventRepository.findByContentId(
                    contentId,
                    transaction
                );

            if (!event) {
                const error =
                    new Error("Event details not found");

                error.statusCode = 404;
                throw error;
            }

            const startTime =
                eventData.start_time ??
                event.start_time;

            const endTime =
                eventData.end_time ??
                event.end_time;

            if (
                endTime &&
                endTime <= startTime
            ) {
                const error =
                    new Error(
                        "End time must be after start time"
                    );

                error.statusCode = 400;
                throw error;
            }

            return eventRepository.update(
                contentId,
                eventData,
                transaction
            );
        }
    );
};

export const deleteEvent = async (
    contentId
) => {
    const deleted =
        await eventRepository.remove(
            contentId
        );

    if (!deleted) {
        const error =
            new Error("Event details not found");

        error.statusCode = 404;
        throw error;
    }

    return true;
};