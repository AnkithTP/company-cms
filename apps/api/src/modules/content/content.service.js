import sequelize from "../../config/database.js";
import * as contentRepository from "./content.repository.js";
import * as blockRepository from "./content-block.repository.js";
import * as revisionRepository
    from "./content-revision.repository.js";

import * as mediaRepository from "../media/media.repository.js";

const createContent = async (contentData, authorId) => {
    const existingSlug = await contentRepository.findBySlug(
        contentData.slug
    );

    if (existingSlug) {
        const error = new Error("Content slug already exists");
        error.statusCode = 409;
        throw error;
    }

    const content = await contentRepository.create({
        title: contentData.title,
        slug: contentData.slug,
        content_type: contentData.content_type,
        author_id: authorId,
        status: "DRAFT",
        expires_at: contentData.expires_at || null,
    });

    return content;
};

const getAllContents = async () => {
    return await contentRepository.findAll();
};

const getContentById = async (id) => {
    const content = await contentRepository.findById(id);

    if (!content) {
        const error = new Error("Content not found");
        error.statusCode = 404;
        throw error;
    }

    return content;
};

const updateContent = async (
    contentId,
    contentData,
    userId
) => {
    return await sequelize.transaction(async (transaction) => {
        const content = await contentRepository.findById(
            contentId
        );

        if (!content) {
            const error = new Error("Content not found");
            error.statusCode = 404;
            throw error;
        }

        if (
            contentData.slug &&
            contentData.slug !== content.slug
        ) {
            const existingSlug =
                await contentRepository.findBySlug(
                    contentData.slug
                );

            if (existingSlug) {
                const error = new Error(
                    "Content slug already exists"
                );
                error.statusCode = 409;
                throw error;
            }
        }

        const updatedContent =
            await contentRepository.update(
                contentId,
                contentData,
                transaction
            );

        return updatedContent;
    });
};

 const saveEditorContent = async (
    contentId,
    editorData,
    userId
) => {
    return sequelize.transaction(async (transaction) => {
        /*
         * ============================================================
         * STEP 1: Check whether content exists
         * ============================================================
         */

        const existingContent = await contentRepository.findById(
            contentId,
            transaction
        );

        if (!existingContent) {
            const error = new Error("Content not found");
            error.statusCode = 404;
            throw error;
        }

        /*
         * ============================================================
         * STEP 2: Check slug uniqueness
         * ============================================================
         *
         * We only need to check if the slug is being changed.
         */

        const existingSlug = await contentRepository.findBySlug(
            editorData.slug,
            transaction
        );

        if (
            existingSlug &&
            existingSlug.id !== contentId
        ) {
            const error = new Error(
                "Another content already uses this slug"
            );

            error.statusCode = 409;
            throw error;
        }

        /*
         * ============================================================
         * STEP 3: Validate media used by editor blocks
         * ============================================================
         *
         * IMAGE  -> must reference IMAGE media
         * VIDEO  -> must reference VIDEO media
         * DOCUMENT -> must reference DOCUMENT media
         */

        for (const block of editorData.blocks) {
            /*
             * We only need media validation for these block types.
             */

            if (
                block.block_type !== "IMAGE" &&
                block.block_type !== "VIDEO" &&
                block.block_type !== "DOCUMENT"
            ) {
                continue;
            }

            /*
             * Check whether media_id exists in the block.
             */

            const mediaId = block.content?.media_id;

            if (!mediaId) {
                const error = new Error(
                    `${block.block_type} block requires media_id`
                );

                error.statusCode = 400;
                throw error;
            }

            /*
             * Find the media record in database.
             */

            const media = await mediaRepository.findById(
                mediaId
            );

            if (!media) {
                const error = new Error(
                    `Media not found: ${mediaId}`
                );

                error.statusCode = 400;
                throw error;
            }

            /*
             * Expected media type based on block type.
             */

            const expectedFileType = {
                IMAGE: "IMAGE",
                VIDEO: "VIDEO",
                DOCUMENT: "DOCUMENT",
            }[block.block_type];

            /*
             * Make sure the media type matches
             * the editor block type.
             */

            if (media.file_type !== expectedFileType) {
                const error = new Error(
                    `${block.block_type} block requires ${expectedFileType} media`
                );

                error.statusCode = 400;
                throw error;
            }
        }

        /*
         * ============================================================
         * STEP 4: Update content metadata
         * ============================================================
         */

        await contentRepository.update(
            contentId,
            {
                title: editorData.title,
                slug: editorData.slug,
                content_type: editorData.content_type,
                expires_at: editorData.expires_at ?? null,
            },
            transaction
        );

        /*
         * ============================================================
         * STEP 5: Get existing blocks
         * ============================================================
         */

        const existingBlocks =
            await blockRepository.findByContentId(
                contentId,
                transaction
            );

        /*
         * Convert existing blocks into a Map
         * so we can quickly find them by ID.
         */

        const existingBlockMap = new Map(
            existingBlocks.map((block) => [
                block.id,
                block,
            ])
        );

        /*
         * Keep track of block IDs that still exist
         * in the editor.
         */

        const incomingBlockIds = [];

        /*
         * ============================================================
         * STEP 6: Create / update blocks
         * ============================================================
         */

        for (const block of editorData.blocks) {

            /*
             * ----------------------------------------------------------
             * Existing block
             * ----------------------------------------------------------
             */

            if (block.id) {
                const existingBlock =
                    existingBlockMap.get(block.id);

                /*
                 * Prevent someone from using a block ID
                 * belonging to another content.
                 */

                if (!existingBlock) {
                    const error = new Error(
                        `Block ${block.id} does not belong to this content`
                    );

                    error.statusCode = 400;
                    throw error;
                }

                await blockRepository.update(
                    block.id,
                    {
                        block_type: block.block_type,
                        block_order: block.block_order,
                        content: block.content,
                        style: block.style ?? null,
                    },
                    transaction
                );

                incomingBlockIds.push(block.id);
            }

            /*
             * ----------------------------------------------------------
             * New block
             * ----------------------------------------------------------
             */

            else {
                const newBlock =
                    await blockRepository.create(
                        {
                            content_id: contentId,
                            block_type: block.block_type,
                            block_order: block.block_order,
                            content: block.content,
                            style: block.style ?? null,
                        },
                        transaction
                    );

                incomingBlockIds.push(newBlock.id);
            }
        }

        /*
         * ============================================================
         * STEP 7: Delete blocks removed from editor
         * ============================================================
         */

        await blockRepository.deleteNotInIds(
            contentId,
            incomingBlockIds,
            transaction
        );

        /*
         * ============================================================
         * STEP 8: Create revision snapshot
         * ============================================================
         */

        const latestRevision =
            await revisionRepository.findLatestByContentId(
                contentId,
                transaction
            );

        const nextVersion =
            latestRevision
                ? latestRevision.version_number + 1
                : 1;

        await revisionRepository.create(
            {
                content_id: contentId,
                version_number: nextVersion,
                created_by: userId,
                title: editorData.title,
                blocks: editorData.blocks,
            },
            transaction
        );

        /*
         * ============================================================
         * STEP 9: Return updated content
         * ============================================================
         */

        const updatedContent =
            await contentRepository.findById(
                contentId,
                transaction
            );

        return updatedContent;
    });
};

 const getContents = async (filters) => {
    const page = Math.max(
        Number(filters.page) || 1,
        1
    );

    const limit = Math.min(
        Math.max(
            Number(filters.limit) || 10,
            1
        ),
        100
    );

    const result =
        await contentRepository.findAllWithFilters({
            search: filters.search,
            content_type: filters.content_type,
            status: filters.status,
            author_id: filters.author_id,

            page,
            limit,

            sort: filters.sort,
            order: filters.order,
        });

    const totalPages =
        Math.ceil(result.count / limit);

    return {
        data: result.rows,

        pagination: {
            page,
            limit,
            total: result.count,
            totalPages,
        },
    };
};
export {
    createContent,
    getAllContents,
    getContentById,
    updateContent,
    saveEditorContent,
    getContents
};