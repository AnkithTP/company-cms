import sequelize from "../../config/database.js";
import * as revisionRepository from "./content-revision.repository.js";
import * as contentRepository from "./content.repository.js";
import * as blockRepository from "./content-block.repository.js";
import * as permissionRepository
    from "../permissions/permission.repository.js";

const createRevision = async (contentId, userId) => {
    return await sequelize.transaction(async (transaction) => {
        const content =
            await revisionRepository.findContentWithBlocks(
                contentId,
                transaction
            );

        if (!content) {
            const error = new Error("Content not found");
            error.statusCode = 404;
            throw error;
        }

        const latestRevision =
            await revisionRepository.findLatestByContentId(
                contentId,
                transaction
            );

        const nextVersion = latestRevision
            ? latestRevision.version_number + 1
            : 1;

        const blocks = content.blocks.map((block) => ({
            block_type: block.block_type,
            block_order: block.block_order,
            content: block.content,
            style: block.style,
        }));

        const revision = await revisionRepository.create(
            {
                content_id: content.id,
                version_number: nextVersion,
                created_by: userId,
                title: content.title,
                blocks,
            },
            transaction
        );

        return revision;
    });
};

const getRevisions = async (contentId) => {
    const content =
        await revisionRepository.findContentWithBlocks(contentId);

    if (!content) {
        const error = new Error("Content not found");
        error.statusCode = 404;
        throw error;
    }

    return await revisionRepository.findByContentId(contentId);
};

const getRevisionById = async (revisionId) => {
    const revision =
        await revisionRepository.findById(revisionId);

    if (!revision) {
        const error = new Error("Content revision not found");
        error.statusCode = 404;
        throw error;
    }

    return revision;
};

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

        const oldStatus =
            content.status;

        // Find reviewers
        const reviewers =
            await permissionRepository
                .findUsersWithPermission(
                    "content:publish",
                    transaction
                );

        // Change status
        await contentRepository.update(
            contentId,
            {
                status: "SUBMITTED"
            },
            transaction
        );

        // Audit log
        await auditService.createAuditLog({
            userId,

            action: "SUBMIT_CONTENT",

            entityType: "CONTENT",

            entityId: content.id,

            oldValues: {
                status: oldStatus
            },

            newValues: {
                status: "SUBMITTED"
            },

            transaction
        });

        // Notify reviewers
        await notificationService.notifyUsers({
            users: reviewers,

            title: "Content submitted for review",

            message:
                `The content "${content.title}" ` +
                `has been submitted for review.`,

            notificationType:
                "CONTENT_SUBMITTED",

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

const restoreRevision = async (contentId, revisionId, userId) => {
    return await sequelize.transaction(async (transaction) => {
        const revision = await revisionRepository.findById(revisionId);
        if (!revision || revision.content_id !== contentId) {
            const error = new Error("Revision not found");
            error.statusCode = 404;
            throw error;
        }

        const content = await contentRepository.findById(contentId, transaction);
        if (!content) {
            const error = new Error("Content not found");
            error.statusCode = 404;
            throw error;
        }

        // Update content title
        await contentRepository.update(
            contentId,
            { title: revision.title },
            transaction
        );

        // Delete existing blocks
        await blockRepository.deleteNotInIds(contentId, [], transaction);

        // Recreate blocks from revision
        const restoredBlocks = Array.isArray(revision.blocks) ? revision.blocks : [];
        for (let i = 0; i < restoredBlocks.length; i++) {
            const block = restoredBlocks[i];
            await blockRepository.createWithTransaction(
                {
                    content_id: contentId,
                    block_type: block.block_type || "PARAGRAPH",
                    block_order: block.block_order ?? i + 1,
                    content: block.content || {},
                    style: block.style ?? null,
                },
                transaction
            );
        }

        // Create a new snapshot documenting the restoration
        const latestRevision = await revisionRepository.findLatestByContentId(
            contentId,
            transaction
        );
        const nextVersion = latestRevision ? latestRevision.version_number + 1 : 1;

        await revisionRepository.create(
            {
                content_id: contentId,
                version_number: nextVersion,
                created_by: userId,
                title: revision.title,
                blocks: restoredBlocks,
            },
            transaction
        );

        return await contentRepository.findById(contentId, transaction);
    });
};

export {
    createRevision,
    getRevisions,
    getRevisionById,
    restoreRevision,
};