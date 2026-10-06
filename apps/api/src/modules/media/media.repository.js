import Media from "./media.model.js";
import User from "../users/user.model.js";

export const create = async (mediaData, transaction = null) => {
    return Media.create(mediaData, {
        transaction,
    });
};

export const findAll = async () => {
    return Media.findAll({
        include: [
            {
                model: User,
                as: "uploader",
                attributes: [
                    "id",
                    "employee_code",
                    "first_name",
                    "last_name",
                    "email",
                ],
            },
        ],
        order: [["created_at", "DESC"]],
    });
};

export const findById = async (id) => {
    return Media.findByPk(id, {
        include: [
            {
                model: User,
                as: "uploader",
                attributes: [
                    "id",
                    "employee_code",
                    "first_name",
                    "last_name",
                    "email",
                ],
            },
        ],
    });
};

export const remove = async (id) => {
    return Media.destroy({ where: { id } });
};