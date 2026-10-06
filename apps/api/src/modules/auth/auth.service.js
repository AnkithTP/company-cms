import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import sequelize from "../../config/database.js";
import { UserRole } from "../../database/models.js";
import * as userRepository from "../users/user.repository.js";
import * as roleRepository from "../roles/role.repository.js";
import * as permissionRepository from "../permissions/permission.repository.js";

const login = async (email, password) => {
    const user = await userRepository.findByEmailForAuth(email);

    if (!user) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    if (!user.is_active) {
        const error = new Error("User account is inactive");
        error.statusCode = 403;
        throw error;
    }

    const passwordMatches = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!passwordMatches) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const token = jwt.sign(
        {
            userId: user.id,
            email: user.email,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1h",
        }
    );

    const [userWithRoles, permissions] = await Promise.all([
        userRepository.findByIdWithRoles(user.id),
        permissionRepository.findUserPermissions(user.id),
    ]);

    const roles = userWithRoles?.roles?.map((r) => r.name) || [];

    return {
        user: {
            id: user.id,
            employee_code: user.employee_code,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            is_active: user.is_active,
            roles,
            permissions,
        },
        token,
    };
};

const register = async (userData) => {
    const existingEmail = await userRepository.findByEmail(userData.email);

    if (existingEmail) {
        const error = new Error("Email already exists");
        error.statusCode = 409;
        throw error;
    }

    const existingEmployeeCode = await userRepository.findByEmployeeCode(
        userData.employee_code
    );

    if (existingEmployeeCode) {
        const error = new Error("Employee code already exists");
        error.statusCode = 409;
        throw error;
    }

    return await sequelize.transaction(async (transaction) => {
        const passwordHash = await bcrypt.hash(userData.password, 12);

        const user = await userRepository.create(
            {
                employee_code: userData.employee_code,
                first_name: userData.first_name,
                last_name: userData.last_name,
                email: userData.email,
                password_hash: passwordHash,
            },
            transaction
        );

        const requestedRoleName = (userData.role || "EMPLOYEE").trim().toUpperCase();
        const role = await roleRepository.findByName(requestedRoleName, transaction);

        if (!role) {
            const error = new Error(`Role "${requestedRoleName}" not found`);
            error.statusCode = 400;
            throw error;
        }

        await UserRole.create(
            {
                user_id: user.id,
                role_id: role.id,
            },
            { transaction }
        );

        const permissions = await permissionRepository.findUserPermissions(user.id);

        return {
            id: user.id,
            employee_code: user.employee_code,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            is_active: user.is_active,
            roles: [role.name],
            permissions: permissions.length > 0 ? permissions : ["content:read"],
        };
    });
};

const getRoles = async () => {
    return await roleRepository.findAll();
};

const getMe = async (userId) => {
    const userWithRoles = await userRepository.findByIdWithRoles(userId);

    if (!userWithRoles) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    const permissions = await permissionRepository.findUserPermissions(userId);
    const roles = userWithRoles.roles?.map((r) => r.name) || [];

    return {
        id: userWithRoles.id,
        employee_code: userWithRoles.employee_code,
        first_name: userWithRoles.first_name,
        last_name: userWithRoles.last_name,
        email: userWithRoles.email,
        is_active: userWithRoles.is_active,
        roles,
        permissions,
    };
};

export {
    login,
    register,
    getMe,
    getRoles,
};