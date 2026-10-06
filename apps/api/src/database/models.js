import User from "../modules/users/user.model.js";
import Role from "../modules/roles/role.model.js";
import Permission from "../modules/permissions/permission.model.js";
import UserRole from "../modules/users/user-role.model.js";
import RolePermission from "../modules/roles/role-permission.model.js";
import Content from "../modules/content/content.model.js";
import ContentBlock from "../modules/content/content-block.model.js";
import ContentRevision from "../modules/content/content-revision.model.js";
import AuditLog from "../modules/audit/audit-log.model.js";
import Category from "../modules/categories/category.model.js";
import ContentCategory from "../modules/categories/content-category.model.js";
import Media from "../modules/media/media.model.js";
import EventDetail from "../modules/event/event.model.js";
import Notification from "../modules/notification/notification.model.js";

// User ↔ Role
User.belongsToMany(Role, {
    through: UserRole,
    foreignKey: "user_id",
    otherKey: "role_id",
    as: "roles",
});

Role.belongsToMany(User, {
    through: UserRole,
    foreignKey: "role_id",
    otherKey: "user_id",
    as: "users",
});

// Role ↔ Permission
Role.belongsToMany(Permission, {
    through: RolePermission,
    foreignKey: "role_id",
    otherKey: "permission_id",
    as: "permissions",
});

Permission.belongsToMany(Role, {
    through: RolePermission,
    foreignKey: "permission_id",
    otherKey: "role_id",
    as: "roles",
});

// User → Content
User.hasMany(Content, {
    foreignKey: "author_id",
    as: "contents",
});

Content.belongsTo(User, {
    foreignKey: "author_id",
    as: "author",
});

// Content → ContentBlock
Content.hasMany(ContentBlock, {
    foreignKey: "content_id",
    as: "blocks",
    onDelete: "CASCADE",
});

ContentBlock.belongsTo(Content, {
    foreignKey: "content_id",
    as: "parentContent",
});

// Content → ContentRevision
Content.hasMany(ContentRevision, {
    foreignKey: "content_id",
    as: "revisions",
    onDelete: "CASCADE",
});

ContentRevision.belongsTo(Content, {
    foreignKey: "content_id",
    as: "content",
});

// User → ContentRevision
User.hasMany(ContentRevision, {
    foreignKey: "created_by",
    as: "contentRevisions",
});

ContentRevision.belongsTo(User, {
    foreignKey: "created_by",
    as: "createdBy",
});

User.hasMany(AuditLog, {
    foreignKey: "user_id",
    as: "auditLogs",
});

AuditLog.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
});

// Category → child categories
Category.hasMany(Category, {
    foreignKey: "parent_id",
    as: "children",
});

Category.belongsTo(Category, {
    foreignKey: "parent_id",
    as: "parent",
});

// Content ↔ Category
Content.belongsToMany(Category, {
    through: ContentCategory,
    foreignKey: "content_id",
    otherKey: "category_id",
    as: "categories",
});

Category.belongsToMany(Content, {
    through: ContentCategory,
    foreignKey: "category_id",
    otherKey: "content_id",
    as: "contents",
});

User.hasMany(Media, {
    foreignKey: "uploaded_by",
    as: "media",
});

Media.belongsTo(User, {
    foreignKey: "uploaded_by",
    as: "uploader",
});

Content.hasOne(EventDetail, {
    foreignKey: "content_id",
    as: "eventDetails",
    onDelete: "CASCADE",
});

EventDetail.belongsTo(Content, {
    foreignKey: "content_id",
    as: "content",
});

User.hasMany(Notification, {
    foreignKey: "user_id",
    as: "notifications",
    onDelete: "CASCADE",
});

Notification.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
});


export {
    User,
    Role,
    Permission,
    UserRole,
    RolePermission,
    Content,
    ContentBlock,
    ContentRevision,
    AuditLog,
    Category,
    ContentCategory,
    Media,
    EventDetail,
    Notification,
};