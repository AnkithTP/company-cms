import apiClient from "../../api/client";

import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    MeResponse,
} from "./auth.types";

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(
        "/auth/login",
        credentials,
    );

    return response.data;
};

export const register = async (
    data: RegisterRequest,
): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>(
        "/auth/register",
        data,
    );

    return response.data;
};

export const getMe = async (): Promise<MeResponse> => {
    const response = await apiClient.get<MeResponse>("/auth/me");

    return response.data;
};

export const getRoles = async (): Promise<import("./auth.types").RoleItem[]> => {
    const response = await apiClient.get<import("./auth.types").RolesResponse>("/auth/roles");
    return response.data.data;
};

