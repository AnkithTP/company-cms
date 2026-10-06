import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const Permission = sequelize.define(
    "Permission",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },

        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },

        description: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    },
    {
        tableName: "permissions",
        timestamps: true,
        underscored: true,
    }
);

export default Permission;