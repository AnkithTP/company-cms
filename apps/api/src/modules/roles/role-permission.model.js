import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const RolePermission = sequelize.define(
    "RolePermission",
    {
        role_id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },

        permission_id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
    },
    {
        tableName: "role_permissions",
        timestamps: false,
    }
);

export default RolePermission;