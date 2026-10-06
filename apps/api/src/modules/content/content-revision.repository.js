import {
    ContentRevision,
    Content,
    ContentBlock,
} from "../../database/models.js";

const create = async (revisionData, transaction = null) => {
    return await ContentRevision.create(revisionData, {
        transaction,
    });
};

const findByContentId = async (contentId) => {
    return await ContentRevision.findAll({
        where: {
            content_id: contentId,
        },
        order: [["version_number", "DESC"]],
    });
};

const findById = async (id) => {
    return await ContentRevision.findByPk(id);
};

const findLatestByContentId = async (
    contentId,
    transaction = null
) => {
    return await ContentRevision.findOne({
        where: {
            content_id: contentId,
        },
        order: [["version_number", "DESC"]],
        transaction,
    });
};

const findContentWithBlocks = async (
    contentId,
    transaction = null
) => {
    return await Content.findByPk(contentId, {
        include: [
            {
                model: ContentBlock,
                as: "blocks",
                order: [["block_order", "ASC"]],
            },
        ],
        transaction,
    });
};

export {
    create,
    findByContentId,
    findById,
    findLatestByContentId,
    findContentWithBlocks,
};