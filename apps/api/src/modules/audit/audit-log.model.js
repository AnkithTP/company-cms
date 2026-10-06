import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const AuditLog = sequelize.define(
    "AuditLog",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },

        user_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },

        action: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        entity_type: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },

        entity_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },

        old_values: {
            type: DataTypes.JSONB,
            allowNull: true,
        },

        new_values: {
            type: DataTypes.JSONB,
            allowNull: true,
        },

        ip_address: {
            type: DataTypes.STRING(45),
            allowNull: true,
        },
    },
    {
        tableName: "audit_logs",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: false,
        underscored: true,
    }
);

export default AuditLog;