import sequelize from "../../config/database.js";

import * as contentRepository
    from "./content.repository.js";

import * as auditService
    from "../audit/audit-log.service.js";

import * as notificationService
    from "../notification/notification.service.js";

import * as permissionRepository
    from "../permissions/permission.repository.js";



const ensureNotAuthor = (content, userId) => {
    if (content.author_id === userId) {
        const error = new Error(
            "Content author cannot perform this workflow action"
        );

        error.statusCode = 403;

        throw error;
    }
};


/*
|--------------------------------------------------------------------------
| Submit Content
|--------------------------------------------------------------------------
| DRAFT → SUBMITTED
|
| Notification:
| Users with content:publish permission
*/
export const submitContent = async (
    contentId,
    userId
) => {

    return sequelize.transaction(async (transaction) => {

        const content =
            await contentRepository.findById(
                contentId,
                transaction
            );

        if (!content) {
            const error =
                new Error("Content not found");

            error.statusCode = 404;

            throw error;
        }

        if (content.status !== "DRAFT") {
            const error =
                new Error(
                    "Only draft content can be submitted"
                );

            error.statusCode = 400;

            throw error;
        }

        const reviewers =
            await permissionRepository.findUsersWithPermission(
                "content:publish",
                transaction
            );

        const recipients =
            reviewers.filter(
                (user) => user.id !== userId
            );

        await contentRepository.update(
            contentId,
            {
                status: "SUBMITTED"
            },
            transaction
        );

        await auditService.createAuditLog({
            userId,
            action: "SUBMIT_CONTENT",
            entityType: "CONTENT",
            entityId: content.id,

            oldValues: {
                status: "DRAFT"
            },

            newValues: {
                status: "SUBMITTED"
            },

            transaction
        });

        await notificationService.notifyUsers({
            users: recipients,

            title: "Content submitted for review",

            message:
                `The content "${content.title}" ` +
                `has been submitted for review.`,

            notificationType: "CONTENT_SUBMITTED",

            entityType: "CONTENT",

            entityId: content.id,

            transaction
        });

        return contentRepository.findById(
            contentId,
            transaction
        );
    });
};


/*
|--------------------------------------------------------------------------
| Start Review
|--------------------------------------------------------------------------
| SUBMITTED → UNDER_REVIEW
|
| Notification:
| Content author
*/
export const startReview = async (
    contentId,
    userId
) => {

    return sequelize.transaction(async (transaction) => {

        const content =
            await contentRepository.findById(
                contentId,
                transaction
            );

        if (!content) {
            const error =
                new Error("Content not found");

            error.statusCode = 404;

            throw error;
        }

        if (content.status !== "SUBMITTED") {
            const error =
                new Error(
                    "Only submitted content can enter review"
                );

            error.statusCode = 400;

            throw error;
        }

        ensureNotAuthor(content, userId);

        await contentRepository.update(
            contentId,
            {
                status: "UNDER_REVIEW"
            },
            transaction
        );

        await auditService.createAuditLog({
            userId,
            action: "START_REVIEW",
            entityType: "CONTENT",
            entityId: content.id,

            oldValues: {
                status: "SUBMITTED"
            },

            newValues: {
                status: "UNDER_REVIEW"
            },

            transaction
        });

        await notificationService.notifyContentAuthor({
            content,

            title: "Content is under review",

            message:
                `Your content "${content.title}" ` +
                `is now under review.`,

            notificationType: "CONTENT_UNDER_REVIEW",

            transaction
        });

        return contentRepository.findById(
            contentId,
            transaction
        );
    });
};


/*
|--------------------------------------------------------------------------
| Approve Content
|--------------------------------------------------------------------------
| UNDER_REVIEW → APPROVED
|
| Notification:
| Content author
*/
export const approveContent = async (
    contentId,
    userId
) => {

    return sequelize.transaction(async (transaction) => {

        const content =
            await contentRepository.findById(
                contentId,
                transaction
            );

        if (!content) {
            const error =
                new Error("Content not found");

            error.statusCode = 404;

            throw error;
        }

        if (content.status !== "UNDER_REVIEW") {
            const error =
                new Error(
                    "Only content under review can be approved"
                );

            error.statusCode = 400;

            throw error;
        }

        ensureNotAuthor(content,userId);

        await contentRepository.update(
            contentId,
            {
                status: "APPROVED"
            },
            transaction
        );

        await auditService.createAuditLog({
            userId,
            action: "APPROVE_CONTENT",
            entityType: "CONTENT",
            entityId: content.id,

            oldValues: {
                status: "UNDER_REVIEW"
            },

            newValues: {
                status: "APPROVED"
            },

            transaction
        });

        await notificationService.notifyContentAuthor({
            content,

            title: "Content approved",

            message:
                `Your content "${content.title}" ` +
                `has been approved and is ready for publishing.`,

            notificationType: "CONTENT_APPROVED",

            transaction
        });

        return contentRepository.findById(
            contentId,
            transaction
        );
    });
};


/*
|--------------------------------------------------------------------------
| Reject Content
|--------------------------------------------------------------------------
| UNDER_REVIEW → DRAFT
|
| Notification:
| Content author
*/
export const rejectContent = async (
    contentId,
    userId,
    reason
) => {

    return sequelize.transaction(async (transaction) => {

        const content =
            await contentRepository.findById(
                contentId,
                transaction
            );

        if (!content) {
            const error =
                new Error("Content not found");

            error.statusCode = 404;

            throw error;
        }

        if (content.status !== "UNDER_REVIEW") {
            const error =
                new Error(
                    "Only content under review can be rejected"
                );

            error.statusCode = 400;

            throw error;
        }

        ensureNotAuthor(content, userId);

        await contentRepository.update(
            contentId,
            {
                status: "DRAFT"
            },
            transaction
        );

        await auditService.createAuditLog({
            userId,
            action: "REJECT_CONTENT",
            entityType: "CONTENT",
            entityId: content.id,

            oldValues: {
                status: "UNDER_REVIEW"
            },

            newValues: {
                status: "DRAFT"
            },

            transaction
        });

        await notificationService.notifyContentAuthor({
            content,

            title: "Content rejected",

            message:
                `Your content "${content.title}" ` +
                `has been rejected and moved back to draft.`,

            notificationType: "CONTENT_REJECTED",

            transaction
        });

        return contentRepository.findById(
            contentId,
            transaction
        );
    });
};


/*
|--------------------------------------------------------------------------
| Publish Content
|--------------------------------------------------------------------------
| APPROVED → PUBLISHED
|
| Notification:
| Content author
*/
export const publishContent = async (
    contentId,
    userId
) => {

    return sequelize.transaction(async (transaction) => {

        const content =
            await contentRepository.findById(
                contentId,
                transaction
            );

        if (!content) {
            const error =
                new Error("Content not found");

            error.statusCode = 404;

            throw error;
        }

        if (content.status !== "APPROVED") {
            const error =
                new Error(
                    "Only approved content can be published"
                );

            error.statusCode = 400;

            throw error;
        }

        await contentRepository.update(
            contentId,
            {
                status: "PUBLISHED",
                published_at: new Date()
            },
            transaction
        );

        await auditService.createAuditLog({
            userId,
            action: "PUBLISH_CONTENT",
            entityType: "CONTENT",
            entityId: content.id,

            oldValues: {
                status: "APPROVED"
            },

            newValues: {
                status: "PUBLISHED",
                published_at: new Date()
            },

            transaction
        });

        await notificationService.notifyContentAuthor({
            content,

            title: "Content published",

            message:
                `Your content "${content.title}" ` +
                `has been published successfully.`,

            notificationType: "CONTENT_PUBLISHED",

            transaction
        });

        return contentRepository.findById(
            contentId,
            transaction
        );
    });
};


/*
|--------------------------------------------------------------------------
| Archive Content
|--------------------------------------------------------------------------
| PUBLISHED → ARCHIVED
|
| Notification:
| Content author
*/
export const archiveContent = async (
    contentId,
    userId
) => {

    return sequelize.transaction(async (transaction) => {

        const content =
            await contentRepository.findById(
                contentId,
                transaction
            );

        if (!content) {
            const error =
                new Error("Content not found");

            error.statusCode = 404;

            throw error;
        }

        if (content.status !== "PUBLISHED") {
            const error =
                new Error(
                    "Only published content can be archived"
                );

            error.statusCode = 400;

            throw error;
        }

        await contentRepository.update(
            contentId,
            {
                status: "ARCHIVED"
            },
            transaction
        );

        await auditService.createAuditLog({
            userId,
            action: "ARCHIVE_CONTENT",
            entityType: "CONTENT",
            entityId: content.id,

            oldValues: {
                status: "PUBLISHED"
            },

            newValues: {
                status: "ARCHIVED"
            },

            transaction
        });

        await notificationService.notifyContentAuthor({
            content,

            title: "Content archived",

            message:
                `Your content "${content.title}" ` +
                `has been archived.`,

            notificationType: "CONTENT_ARCHIVED",

            transaction
        });

        return contentRepository.findById(
            contentId,
            transaction
        );
    });
};