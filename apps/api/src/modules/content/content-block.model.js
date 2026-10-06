import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const ContentBlock = sequelize.define(
    "ContentBlock",
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

        block_type: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },

        block_order: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        content: {
            type: DataTypes.JSONB,
            allowNull: false,
        },

        style: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
    },
    {
        tableName: "content_blocks",
        timestamps: true,
        underscored: true,
    }
);

export default ContentBlock;