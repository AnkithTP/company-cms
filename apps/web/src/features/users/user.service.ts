import apiClient from "../../api/client";
import type { UserListItem, CreateUserRequest } from "./user.types";

export const fetchAllUsers = async (): Promise<UserListItem[]> => {
    const res = await apiClient.get<{ success: boolean; data: UserListItem[] }>("/users");
    return res.data.data;
};

export const createNewUser = async (data: CreateUserRequest): Promise<UserListItem> => {
    const res = await apiClient.post<{ success: boolean; data: UserListItem }>("/users", data);
    return res.data.data;
};

export const updateUserStatus = async (
    id: string,
    isActive: boolean
): Promise<UserListItem> => {
    const res = await apiClient.put<{ success: boolean; data: UserListItem }>(
        `/users/${id}/status`,
        { is_active: isActive }
    );
    return res.data.data;
};

export const updateUserRole = async (
    id: string,
    role: string
): Promise<UserListItem> => {
    const res = await apiClient.put<{ success: boolean; data: UserListItem }>(
        `/users/${id}/role`,
        { role }
    );
    return res.data.data;
};
