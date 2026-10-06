"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("content_blocks", {
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

      block_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },

      block_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      content: {
        type: Sequelize.JSONB,
        allowNull: false,
      },

      style: {
        type: Sequelize.JSONB,
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable("content_blocks");
  },
};