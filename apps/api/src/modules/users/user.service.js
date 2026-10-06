import * as userRepository from "./user.repository.js";
import * as roleRepository from "../roles/role.repository.js";
import bcrypt from "bcrypt";
import sequelize from "../../config/database.js";
import { User, UserRole } from "../../database/models.js";

const createUser = async (userData) => {
    const existingEmail = await userRepository.findByEmail(
        userData.email
    );

    if (existingEmail) {
        const error = new Error("Email already exists");
        error.statusCode = 409;
        throw error;
    }

    const existingEmployeeCode =
        await userRepository.findByEmployeeCode(
            userData.employee_code
        );

    if (existingEmployeeCode) {
        const error = new Error(
            "Employee code already exists"
        );
        error.statusCode = 409;
        throw error;
    }

    const passwordHash = await bcrypt.hash(
        userData.password || "Password@123",
        12
    );

    return await sequelize.transaction(async (transaction) => {
        const user = await userRepository.create({
            employee_code: userData.employee_code,
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            password_hash: passwordHash,
            is_active: userData.is_active !== undefined ? userData.is_active : true,
        }, transaction);

        const requestedRoleName = (userData.role || "EMPLOYEE").trim().toUpperCase();
        const role = await roleRepository.findByName(requestedRoleName, transaction);
        if (role) {
            await UserRole.create({ user_id: user.id, role_id: role.id }, { transaction });
        }

        return await userRepository.findByIdWithRoles(user.id, transaction);
    });
};

const getAllUsers = async () => {
    return await userRepository.findAll();
};

const getUserById = async (id) => {
    const user = await userRepository.findByIdWithRoles(id);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    return user;
};

const updateUserStatus = async (id, isActive) => {
    const user = await userRepository.findById(id);
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    await User.update({ is_active: isActive }, { where: { id } });
    return await userRepository.findByIdWithRoles(id);
};

const updateUserRole = async (userId, roleName) => {
    return await sequelize.transaction(async (transaction) => {
        const user = await userRepository.findById(userId, transaction);
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        const role = await roleRepository.findByName(roleName, transaction);
        if (!role) {
            const error = new Error(`Role "${roleName}" not found`);
            error.statusCode = 400;
            throw error;
        }

        await UserRole.destroy({ where: { user_id: userId }, transaction });
        await UserRole.create({ user_id: userId, role_id: role.id }, { transaction });

        return await userRepository.findByIdWithRoles(userId, transaction);
    });
};

export {
    createUser,
    getAllUsers,
    getUserById,
    updateUserStatus,
    updateUserRole,
};