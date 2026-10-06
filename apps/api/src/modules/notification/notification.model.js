import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const Notification = sequelize.define(
    "Notification",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        message: {
            type: DataTypes.STRING(1000),
            allowNull: false,
        },

        notification_type: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },

        entity_type: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },

        entity_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },

        is_read: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },

        read_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "notifications",
        timestamps: true,
        underscored: true,
    }
);

export default Notification;