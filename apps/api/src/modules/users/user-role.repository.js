import UserRole from "./user-role.model.js";

export const create = async (
    data,
    transaction = null
) => {
    return UserRole.create(data, {
        transaction,
    });
};