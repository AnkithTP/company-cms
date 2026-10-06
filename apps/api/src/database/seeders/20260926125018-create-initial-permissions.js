"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert("permissions", [
      {
        name: "user:read",
        description: "View users",
        created_at: now,
        updated_at: now,
      },
      {
        name: "user:create",
        description: "Create users",
        created_at: now,
        updated_at: now,
      },
      {
        name: "user:update",
        description: "Update users",
        created_at: now,
        updated_at: now,
      },
      {
        name: "user:delete",
        description: "Delete users",
        created_at: now,
        updated_at: now,
      },

      {
        name: "content:read",
        description: "View content",
        created_at: now,
        updated_at: now,
      },
      {
        name: "content:create",
        description: "Create content",
        created_at: now,
        updated_at: now,
      },
      {
        name: "content:update",
        description: "Update content",
        created_at: now,
        updated_at: now,
      },
      {
        name: "content:delete",
        description: "Delete content",
        created_at: now,
        updated_at: now,
      },
      {
        name: "content:publish",
        description: "Publish content",
        created_at: now,
        updated_at: now,
      },

      {
        name: "media:upload",
        description: "Upload media",
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("permissions", null, {});
  },
};