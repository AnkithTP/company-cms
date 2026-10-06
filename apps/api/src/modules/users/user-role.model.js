import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const UserRole = sequelize.define(
    "UserRole",
    {
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },

        role_id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
    },
    {
        tableName: "user_roles",
        timestamps: false,
    }
);

export default UserRole;