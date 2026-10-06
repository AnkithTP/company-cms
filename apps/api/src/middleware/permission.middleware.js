import * as permissionRepository
    from "../modules/permissions/permission.repository.js";

const requirePermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                const error = new Error("Authentication required");
                error.statusCode = 401;
                throw error;
            }

            const permissions =
                await permissionRepository.findUserPermissions(req.user.id);

            if (!permissions.includes(requiredPermission)) {
                const error = new Error(
                    "You do not have permission to perform this action"
                );

                error.statusCode = 403;
                throw error;
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

export { requirePermission };
export default requirePermission;