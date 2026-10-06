import {
    ContentBlock,
    Content,
} from "../../database/models.js";

import { Op } from "sequelize";

const create = async (blockData) => {
    return await ContentBlock.create(blockData);
};

const findById = async (id) => {
    return await ContentBlock.findByPk(id);
};

const findByContentId = async (
    contentId,
    transaction = null
) => {
    return await ContentBlock.findAll({
        where: {
            content_id: contentId,
        },
        order: [["block_order", "ASC"]],
        transaction,
    });
};

const update = async (
    id,
    blockData,
    transaction = null
) => {
    const [updatedRows] = await ContentBlock.update(
        blockData,
        {
            where: { id },
            transaction,
        }
    );

    if (updatedRows === 0) {
        return null;
    }

    return await ContentBlock.findByPk(id, {
        transaction,
    });
};

const remove = async (id) => {
    return await ContentBlock.destroy({
        where: { id },
    });
};

const findContentById = async (contentId) => {
    return await Content.findByPk(contentId);
};

const findBlocksForReorder = async (contentId, transaction) => {
    return await ContentBlock.findAll({
        where: {
            content_id: contentId,
        },
        order: [["block_order", "ASC"]],
        transaction,
        lock: transaction.LOCK.UPDATE,
    });
};

const findByIdForContent = async (
    blockId,
    contentId,
    transaction = null
) => {
    return await ContentBlock.findOne({
        where: {
            id: blockId,
            content_id: contentId,
        },
        transaction,
    });
};

const createWithTransaction = async (
    blockData,
    transaction
) => {
    return await ContentBlock.create(blockData, {
        transaction,
    });
};

const updateWithTransaction = async (
    blockId,
    contentId,
    blockData,
    transaction
) => {
    const [updatedRows] = await ContentBlock.update(
        blockData,
        {
            where: {
                id: blockId,
                content_id: contentId,
            },
            transaction,
        }
    );

    if (updatedRows === 0) {
        return null;
    }

    return await ContentBlock.findOne({
        where: {
            id: blockId,
            content_id: contentId,
        },
        transaction,
    });
};

const deleteNotInIds = async (
    contentId,
    blockIds,
    transaction
) => {
    const where = {
        content_id: contentId,
    };

    if (blockIds.length > 0) {
        where.id = {
            [Op.notIn]: blockIds,
        };
    }

    return await ContentBlock.destroy({
        where,
        transaction,
    });
};

export {
    create,
    findById,
    findByContentId,
    update,
    remove,
    findContentById,
    findBlocksForReorder,
    findByIdForContent,
    createWithTransaction,
    updateWithTransaction,
    deleteNotInIds
};

