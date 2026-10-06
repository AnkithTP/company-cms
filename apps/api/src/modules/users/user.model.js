import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const User = sequelize.define(
    "User",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },

        employee_code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },

        first_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        last_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },

        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        tableName: "users",
        timestamps: true,
        underscored: true,
    }
);

export default User;