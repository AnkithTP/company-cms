import type { LoginUser } from "../features/auth/auth.types";

/**
 * Checks if the user has an Admin role (e.g., SUPER_ADMIN, ADMIN) or user management permissions.
 */
export const isAdminUser = (user: LoginUser | null | undefined): boolean => {
    if (!user) return false;
    const roles = user.roles || [];
    const hasAdminRole = roles.some((role) => {
        const normalized = role.toUpperCase();
        return normalized === "SUPER_ADMIN" || normalized === "ADMIN";
    });
    const hasAdminPermission =
        user.permissions?.includes("user:read") ||
        user.permissions?.includes("user:create") ||
        user.permissions?.includes("user:update") ||
        false;

    return Boolean(hasAdminRole || hasAdminPermission);
};

/**
 * Checks if the user is strictly an Employee (i.e. has EMPLOYEE role and no admin or editor privileges).
 * Employees are restricted exclusively to the Live Portal.
 */
export const isEmployeeUser = (user: LoginUser | null | undefined): boolean => {
    if (!user) return false;
    const roles = user.roles || [];

    // If user has any administrative or editor roles, they are not an employee-only user
    const hasElevatedRole = roles.some((role) => {
        const normalized = role.toUpperCase();
        return (
            normalized.includes("ADMIN") ||
            normalized === "EDITOR"
        );
    });

    if (hasElevatedRole) return false;

    // Check elevated permissions
    const hasElevatedPermission = user.permissions?.some((perm) =>
        perm.startsWith("content:create") ||
        perm.startsWith("content:update") ||
        perm.startsWith("content:publish") ||
        perm.startsWith("user:")
    );

    if (hasElevatedPermission) return false;

    // Default to true if roles contains EMPLOYEE, or if roles is empty
    return roles.length === 0 || roles.some((r) => r.toUpperCase() === "EMPLOYEE");
};

/**
 * Checks if the user is authorized to access the CMS management panel.
 */
export const canAccessCms = (user: LoginUser | null | undefined): boolean => {
    return !isEmployeeUser(user);
};
