"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("media", {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal("gen_random_uuid()"),
                primaryKey: true,
                allowNull: false,
            },

            original_name: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },

            file_name: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },

            mime_type: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },

            file_type: {
                type: Sequelize.STRING(30),
                allowNull: false,
            },

            file_size: {
                type: Sequelize.BIGINT,
                allowNull: false,
            },

            storage_path: {
                type: Sequelize.STRING(500),
                allowNull: false,
            },

            url: {
                type: Sequelize.STRING(1000),
                allowNull: false,
            },

            alt_text: {
                type: Sequelize.STRING(500),
                allowNull: true,
            },

            uploaded_by: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT",
            },

            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn("NOW"),
            },

            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn("NOW"),
            },
        });

        await queryInterface.addIndex("media", ["uploaded_by"]);
        await queryInterface.addIndex("media", ["file_type"]);
    },

    async down(queryInterface) {
        await queryInterface.dropTable("media");
    },
};