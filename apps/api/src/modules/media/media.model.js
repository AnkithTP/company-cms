import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const Media = sequelize.define(
    "Media",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        original_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        file_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        mime_type: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },

        file_type: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },

        file_size: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },

        storage_path: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },

        url: {
            type: DataTypes.STRING(1000),
            allowNull: false,
        },

        alt_text: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },

        uploaded_by: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    },
    {
        tableName: "media",
        timestamps: true,
        underscored: true,
    }
);

export default Media;