import * as eventService
    from "./event.service.js";

export const createEvent = async (
    req,
    res,
    next
) => {
    try {
        const event =
            await eventService.createEvent(
                req.params.contentId,
                req.body
            );

        res.status(201).json({
            success: true,
            message: "Event created successfully",
            data: event,
        });
    } catch (error) {
        next(error);
    }
};

export const getEvent = async (
    req,
    res,
    next
) => {
    try {
        const event =
            await eventService.getEvent(
                req.params.contentId
            );

        res.status(200).json({
            success: true,
            data: event,
        });
    } catch (error) {
        next(error);
    }
};

export const updateEvent = async (
    req,
    res,
    next
) => {
    try {
        const event =
            await eventService.updateEvent(
                req.params.contentId,
                req.body
            );

        res.status(200).json({
            success: true,
            message: "Event updated successfully",
            data: event,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteEvent = async (
    req,
    res,
    next
) => {
    try {
        await eventService.deleteEvent(
            req.params.contentId
        );

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};