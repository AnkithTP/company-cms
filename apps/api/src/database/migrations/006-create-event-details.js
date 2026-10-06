"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("event_details", {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal("gen_random_uuid()"),
                primaryKey: true,
                allowNull: false,
            },

            content_id: {
                type: Sequelize.UUID,
                allowNull: false,
                unique: true,
                references: {
                    model: "contents",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },

            event_date: {
                type: Sequelize.DATEONLY,
                allowNull: false,
            },

            start_time: {
                type: Sequelize.TIME,
                allowNull: false,
            },

            end_time: {
                type: Sequelize.TIME,
                allowNull: true,
            },

            location: {
                type: Sequelize.STRING(500),
                allowNull: true,
            },

            meeting_url: {
                type: Sequelize.STRING(1000),
                allowNull: true,
            },

            organizer: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },

            registration_url: {
                type: Sequelize.STRING(1000),
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
            "event_details",
            ["event_date"]
        );
    },

    async down(queryInterface) {
        await queryInterface.dropTable("event_details");
    },
};