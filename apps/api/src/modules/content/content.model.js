import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const Content = sequelize.define(
    "Content",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },

        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },

        slug: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },

        content_type: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },

        author_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },

        status: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: "DRAFT",
        },

        published_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        expires_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "contents",
        timestamps: true,
        underscored: true,
    }
);

export default Content;