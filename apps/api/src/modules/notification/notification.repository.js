import Notification from "./notification.model.js";
import User from "../users/user.model.js";

export const create = async (
    notificationData,
    transaction = null
) => {
    return Notification.create(
        notificationData,
        {
            transaction,
        }
    );
};

export const findByUserId = async (
    userId,
    { page = 1, limit = 10 } = {}
) => {
    const offset = (page - 1) * limit;

    return Notification.findAndCountAll({
        where: {
            user_id: userId,
        },

        include: [
            {
                model: User,
                as: "user",
                attributes: [
                    "id",
                    "first_name",
                    "last_name",
                ],
            },
        ],

        order: [
            ["created_at", "DESC"],
        ],

        limit,
        offset,
    });
};

export const findUnreadByUserId = async (
    userId
) => {
    return Notification.findAll({
        where: {
            user_id: userId,
            is_read: false,
        },

        order: [
            ["created_at", "DESC"],
        ],
    });
};

export const markAsRead = async (
    notificationId,
    userId
) => {
    const [updatedRows] =
        await Notification.update(
            {
                is_read: true,
                read_at: new Date(),
            },
            {
                where: {
                    id: notificationId,
                    user_id: userId,
                    is_read: false,
                },
            }
        );

    return updatedRows > 0;
};

export const bulkCreate = async (
    notifications,
    transaction = null
) => {
    return Notification.bulkCreate(
        notifications,
        {
            transaction
        }
    );
};