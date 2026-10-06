import * as notificationService
    from "./notification.service.js";

export const getNotifications = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await notificationService
                .getUserNotifications(
                    req.user.id,
                    req.query.page,
                    req.query.limit
                );

        res.status(200).json({
            success: true,
            data: result.data,
            pagination: result.pagination,
        });
    } catch (error) {
        next(error);
    }
};

export const getUnreadNotifications = async (
    req,
    res,
    next
) => {
    try {
        const notifications =
            await notificationService
                .getUnreadNotifications(
                    req.user.id
                );

        res.status(200).json({
            success: true,
            data: notifications,
        });
    } catch (error) {
        next(error);
    }
};

export const markAsRead = async (
    req,
    res,
    next
) => {
    try {
        await notificationService
            .markNotificationAsRead(
                req.params.id,
                req.user.id
            );

        res.status(200).json({
            success: true,
            message:
                "Notification marked as read",
        });
    } catch (error) {
        next(error);
    }
};