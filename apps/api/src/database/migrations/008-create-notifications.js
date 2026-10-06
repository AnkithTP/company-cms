"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("notifications", {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal("gen_random_uuid()"),
                primaryKey: true,
                allowNull: false,
            },

            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            title: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },

            message: {
                type: Sequelize.STRING(1000),
                allowNull: false,
            },

            notification_type: {
                type: Sequelize.STRING(50),
                allowNull: false,
            },

            entity_type: {
                type: Sequelize.STRING(50),
                allowNull: true,
            },

            entity_id: {
                type: Sequelize.UUID,
                allowNull: true,
            },

            is_read: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },

            read_at: {
                type: Sequelize.DATE,
                allowNull: true,
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

        await queryInterface.addIndex(
            "notifications",
            ["user_id"]
        );

        await queryInterface.addIndex(
            "notifications",
            ["user_id", "is_read"]
        );

        await queryInterface.addIndex(
            "notifications",
            ["created_at"]
        );
    },

    async down(queryInterface) {
        await queryInterface.dropTable("notifications");
    },
};