import Role from "./role.model.js";

export const findByName = async (
    name,
    transaction = null
) => {
    return Role.findOne({
        where: {
            name,
        },
        transaction,
    });
};

export const findAll = async (transaction = null) => {
    return Role.findAll({
        attributes: ["id", "name", "description"],
        order: [["name", "ASC"]],
        transaction,
    });
};