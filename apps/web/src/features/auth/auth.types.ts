export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginUser {
    id: string;
    employee_code: string;
    first_name: string;
    last_name: string;
    email: string;
    is_active: boolean;
    roles?: string[];
    permissions?: string[];
}

export interface LoginData {
    user: LoginUser;
    token: string;
}

export interface LoginResponse {
    success: boolean;
    message: string;
    data: LoginData;
}

export interface RegisterRequest {
    employee_code: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role?: string;
}

export interface RegisterResponse {
    success: boolean;
    message: string;
    data: LoginUser;
}

export interface MeResponse {
    success: boolean;
    data: LoginUser;
}

export interface RoleItem {
    id: string;
    name: string;
    description: string;
}

export interface RolesResponse {
    success: boolean;
    data: RoleItem[];
}
