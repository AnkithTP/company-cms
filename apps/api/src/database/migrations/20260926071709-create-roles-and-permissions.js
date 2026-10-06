"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Roles
    await queryInterface.createTable("roles", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
        allowNull: false,
      },

      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },

      description: {
        type: Sequelize.STRING(255),
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

    // 2. Permissions
    await queryInterface.createTable("permissions", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
        allowNull: false,
      },

      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },

      description: {
        type: Sequelize.STRING(255),
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

    // 3. User ↔ Role
    await queryInterface.createTable("user_roles", {
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

      role_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "roles",
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

    // 4. Role ↔ Permission
    await queryInterface.createTable("role_permissions", {
      role_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "roles",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      permission_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "permissions",
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

    // Composite primary keys prevent duplicate assignments.
    await queryInterface.addConstraint("user_roles", {
      fields: ["user_id", "role_id"],
      type: "primary key",
      name: "pk_user_roles",
    });

    await queryInterface.addConstraint("role_permissions", {
      fields: ["role_id", "permission_id"],
      type: "primary key",
      name: "pk_role_permissions",
    });
  },

  async down(queryInterface) {
    // Drop child tables first because they contain foreign keys.
    await queryInterface.dropTable("role_permissions");
    await queryInterface.dropTable("user_roles");

    await queryInterface.dropTable("permissions");
    await queryInterface.dropTable("roles");
  },
};