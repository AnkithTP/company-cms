export interface UserRole {
    id: string;
    name: string;
}

export interface UserListItem {
    id: string;
    employee_code: string;
    first_name: string;
    last_name: string;
    email: string;
    is_active: boolean;
    roles?: UserRole[];
    created_at: string;
    updated_at: string;
}

export interface CreateUserRequest {
    employee_code: string;
    first_name: string;
    last_name: string;
    email: string;
    password?: string;
    role: string;
}
