"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("content_categories", {
      content_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "contents",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "categories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    await queryInterface.addIndex(
      "content_categories",
      ["category_id"]
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("content_categories");
  },
};