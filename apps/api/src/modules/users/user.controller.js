import * as userService from "./user.service.js";

const createUser = async (req, res, next) => {
    try {
        const user = await userService.createUser(req.body);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

const getAllUsers = async (req, res, next) => {
    try {
        const users = await userService.getAllUsers();

        res.status(200).json({
            success: true,
            data: users,
        });
    } catch (error) {
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.params.id);

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

const updateUserStatus = async (req, res, next) => {
    try {
        const { is_active } = req.body;
        const user = await userService.updateUserStatus(req.params.id, is_active);

        res.status(200).json({
            success: true,
            message: "User status updated successfully",
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

const updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        const user = await userService.updateUserRole(req.params.id, role);

        res.status(200).json({
            success: true,
            message: "User role updated successfully",
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

export {
    createUser,
    getAllUsers,
    getUserById,
    updateUserStatus,
    updateUserRole,
};