import { User, Role } from "../../database/models.js";

 const create = async (
    userData,
    transaction = null
) => {
    return User.create(userData, {
        transaction,
    });
};

const findAll = async () => {
    return await User.findAll({
        attributes: {
            exclude: ["password_hash"],
        },
        include: [
            {
                model: Role,
                as: "roles",
                attributes: ["id", "name"],
                through: {
                    attributes: [],
                },
            },
        ],
        order: [["created_at", "DESC"]],
    });
};

const findById = async (id) => {
    return await User.findByPk(id, {
        attributes: {
            exclude: ["password_hash"],
        },
    });
};

const findByIdWithRoles = async (id, transaction = null) => {
    return await User.findByPk(id, {
        attributes: {
            exclude: ["password_hash"],
        },
        include: [
            {
                model: Role,
                as: "roles",
                attributes: ["id", "name"],
                through: {
                    attributes: [],
                },
            },
        ],
        transaction,
    });
};

 const findByEmail = async (
    email,
    transaction = null
) => {
    return User.findOne({
        where: {
            email,
        },
        attributes: {
            exclude: ["password_hash"],
        },
        transaction,
    });
};

const findByEmailForAuth = async (email) => {
    return await User.findOne({
        where: { email },
    });
};

 const findByEmployeeCode = async (
    employeeCode,
    transaction = null
) => {
    return User.findOne({
        where: {
            employee_code: employeeCode,
        },
        transaction,
    });
};
export {
    create,
    findAll,
    findById,
    findByIdWithRoles,
    findByEmail,
    findByEmailForAuth,
    findByEmployeeCode,
};