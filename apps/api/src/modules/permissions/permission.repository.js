import { User, Role, Permission } from "../../database/models.js";

// import Permission from "./permission.model.js";
// import Role from "../roles/role.model.js";
// import User from "../users/user.model.js";

const findUserPermissions = async (userId) => {
    const user = await User.findByPk(userId, {
        attributes: ["id"],
        include: [
            {
                model: Role,
                as: "roles",
                attributes: ["id", "name"],
                through: {
                    attributes: [],
                },
                include: [
                    {
                        model: Permission,
                        as: "permissions",
                        attributes: ["id", "name"],
                        through: {
                            attributes: [],
                        },
                    },
                ],
            },
        ],
    });

    if (!user) {
        return [];
    }

    const permissions = [];

    for (const role of user.roles) {
        for (const permission of role.permissions) {
            permissions.push(permission.name);
        }
    }

    return [...new Set(permissions)];
};

export const findUsersWithPermission = async (
    permissionName,
    transaction = null
) => {
    return User.findAll({
        attributes: ["id", "email", "first_name", "last_name"],
        include: [
            {
                model: Role,
                as: "roles",
                attributes: [],
                required: true,
                include: [
                    {
                        model: Permission,
                        as: "permissions",
                        attributes: [],
                        where: {
                            name: permissionName,
                        },
                        required: true,
                    },
                ],
            },
        ],
        where: {
            is_active: true,
        },
        distinct: true,
        transaction,
    });
};

export {
    findUserPermissions,
};