import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const Category = sequelize.define(
    "Category",
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
        },

        slug: {
            type: DataTypes.STRING(120),
            allowNull: false,
            unique: true,
        },

        description: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },

        parent_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },

        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        tableName: "categories",
        timestamps: true,
        underscored: true,
    }
);

export default Category;