import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const ContentCategory = sequelize.define(
    "ContentCategory",
    {
        content_id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },

        category_id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
    },
    {
        tableName: "content_categories",
        timestamps: false,
    }
);

export default ContentCategory;