import * as notificationRepository
    from "./notification.repository.js";

export const createNotification = async ({
    userId,
    title,
    message,
    notificationType,
    entityType = null,
    entityId = null,
    transaction = null,
}) => {
    return notificationRepository.create(
        {
            user_id: userId,
            title,
            message,
            notification_type: notificationType,
            entity_type: entityType,
            entity_id: entityId,
        },
        transaction
    );
};

export const getUserNotifications = async (
    userId,
    page = 1,
    limit = 10
) => {
    page = Math.max(
        Number(page) || 1,
        1
    );

    limit = Math.min(
        Math.max(
            Number(limit) || 10,
            1
        ),
        50
    );

    const result =
        await notificationRepository.findByUserId(
            userId,
            {
                page,
                limit,
            }
        );

    return {
        data: result.rows,

        pagination: {
            page,
            limit,
            total: result.count,
            totalPages: Math.ceil(
                result.count / limit
            ),
        },
    };
};

export const getUnreadNotifications = async (
    userId
) => {
    return notificationRepository
        .findUnreadByUserId(userId);
};

export const markNotificationAsRead = async (
    notificationId,
    userId
) => {
    const updated =
        await notificationRepository.markAsRead(
            notificationId,
            userId
        );

    if (!updated) {
        const error = new Error(
            "Notification not found or already read"
        );

        error.statusCode = 404;

        throw error;
    }

    return true;
};


export const notifyContentAuthor = async ({
    content,
    title,
    message,
    notificationType,
    entityType = "CONTENT",
    transaction = null,
}) => {
    return createNotification({
        userId: content.author_id,
        title,
        message,
        notificationType,
        entityType,
        entityId: content.id,
        transaction,
    });
};

export const notifyUsers = async ({
    users,
    title,
    message,
    notificationType,
    entityType = null,
    entityId = null,
    transaction = null
}) => {

    const notifications = users
        .map((user) => ({
            user_id: user.id,
            title,
            message,
            notification_type: notificationType,
            entity_type: entityType,
            entity_id: entityId
        }));

    if (notifications.length === 0) {
        return [];
    }

    return notificationRepository.bulkCreate(
        notifications,
        transaction
    );
};


