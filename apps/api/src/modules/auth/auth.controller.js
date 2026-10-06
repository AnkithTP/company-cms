import * as authService from "./auth.service.js";

const login = async (req, res, next) => {
    try {
        const result = await authService.login(
            req.body.email,
            req.body.password
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const register = async (req, res, next) => {
    try {
        const result = await authService.register(req.body);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getMe = async (req, res, next) => {
    try {
        const result = await authService.getMe(req.user.id);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getRoles = async (req, res, next) => {
    try {
        const roles = await authService.getRoles();

        res.status(200).json({
            success: true,
            data: roles,
        });
    } catch (error) {
        next(error);
    }
};

export {
    login,
    register,
    getMe,
    getRoles,
};