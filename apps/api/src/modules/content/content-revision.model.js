import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const ContentRevision = sequelize.define(
    "ContentRevision",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },

        content_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        version_number: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        created_by: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        blocks: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
    },
    {
        tableName: "content_revisions",
        timestamps: true,
        updatedAt: false,
        underscored: true,
    }
);

export default ContentRevision;