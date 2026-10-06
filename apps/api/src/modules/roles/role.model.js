import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const Role = sequelize.define(
    "Role",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },

        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },

        description: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    },
    {
        tableName: "roles",
        timestamps: true,
        underscored: true,
    }
);

export default Role;