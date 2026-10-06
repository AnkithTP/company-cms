"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert("roles", [
      {
        name: "SUPER_ADMIN",
        description: "Full access to the CMS",
        created_at: now,
        updated_at: now,
      },
      {
        name: "HR_ADMIN",
        description: "Manage HR content and company announcements",
        created_at: now,
        updated_at: now,
      },
      {
        name: "TECH_ADMIN",
        description: "Manage technology-related content",
        created_at: now,
        updated_at: now,
      },
      {
        name: "EDITOR",
        description: "Create and edit content",
        created_at: now,
        updated_at: now,
      },
      {
        name: "EMPLOYEE",
        description: "View published company content",
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("roles", null, {});
  },
};

