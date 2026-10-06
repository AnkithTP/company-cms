"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("content_revisions", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
        allowNull: false,
      },

      content_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "contents",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      version_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      blocks: {
        type: Sequelize.JSONB,
        allowNull: false,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("content_revisions");
  },
};