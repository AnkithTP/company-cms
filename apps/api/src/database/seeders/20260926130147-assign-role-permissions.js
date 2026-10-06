"use strict";

module.exports = {
  async up(queryInterface) {
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id, name FROM roles;`
    );

    const [permissions] = await queryInterface.sequelize.query(
      `SELECT id, name FROM permissions;`
    );

    const roleMap = Object.fromEntries(
      roles.map((role) => [role.name, role.id])
    );

    const permissionMap = Object.fromEntries(
      permissions.map((permission) => [
        permission.name,
        permission.id,
      ])
    );

    const assignments = {
      SUPER_ADMIN: [
        "user:read",
        "user:create",
        "user:update",
        "user:delete",
        "content:read",
        "content:create",
        "content:update",
        "content:delete",
        "content:publish",
        "media:upload",
      ],

      HR_ADMIN: [
        "content:read",
        "content:create",
        "content:update",
        "content:publish",
        "media:upload",
      ],

      TECH_ADMIN: [
        "content:read",
        "content:create",
        "content:update",
        "content:publish",
        "media:upload",
      ],

      EDITOR: [
        "content:read",
        "content:create",
        "content:update",
        "content:publish",
        "media:upload",
      ],

      EMPLOYEE: [
        "content:read",
      ],
    };

    const rows = [];

    for (const [roleName, permissionNames] of Object.entries(
      assignments
    )) {
      for (const permissionName of permissionNames) {
        rows.push({
          role_id: roleMap[roleName],
          permission_id: permissionMap[permissionName],
          created_at: new Date(),
        });
      }
    }

    await queryInterface.bulkInsert("role_permissions", rows);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("role_permissions", null, {});
  },
};