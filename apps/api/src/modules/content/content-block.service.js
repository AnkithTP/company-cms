import * as blockRepository from "./content-block.repository.js";
import sequelize from "../../config/database.js";

const createBlock = async (contentId, blockData) => {
    const content = await blockRepository.findContentById(contentId);

    if (!content) {
        const error = new Error("Content not found");
        error.statusCode = 404;
        throw error;
    }

    const block = await blockRepository.create({
        content_id: contentId,
        block_type: blockData.block_type,
        block_order: blockData.block_order,
        content: blockData.content,
        style: blockData.style || null,
    });

    return block;
};

const getBlocksByContentId = async (contentId) => {
    const content = await blockRepository.findContentById(contentId);

    if (!content) {
        const error = new Error("Content not found");
        error.statusCode = 404;
        throw error;
    }

    return await blockRepository.findByContentId(contentId);
};

const updateBlock = async (blockId, blockData) => {
    const block = await blockRepository.findById(blockId);

    if (!block) {
        const error = new Error("Content block not found");
        error.statusCode = 404;
        throw error;
    }

    return await blockRepository.update(blockId, blockData);
};

const deleteBlock = async (blockId) => {
    const block = await blockRepository.findById(blockId);

    if (!block) {
        const error = new Error("Content block not found");
        error.statusCode = 404;
        throw error;
    }

    await blockRepository.remove(blockId);
};

const reorderBlocks = async (contentId, orderedBlockIds) => {
  return await sequelize.transaction(async (transaction) => {
    const content = await blockRepository.findContentById(
      contentId
    );

    if (!content) {
      const error = new Error("Content not found");
      error.statusCode = 404;
      throw error;
    }

    const blocks =
      await blockRepository.findBlocksForReorder(
        contentId,
        transaction
      );

    if (blocks.length !== orderedBlockIds.length) {
      const error = new Error(
        "All content blocks must be included in the reorder request"
      );
      error.statusCode = 400;
      throw error;
    }

    const existingBlockIds = new Set(
      blocks.map((block) => block.id)
    );

    for (const blockId of orderedBlockIds) {
      if (!existingBlockIds.has(blockId)) {
        const error = new Error(
          `Block ${blockId} does not belong to this content`
        );
        error.statusCode = 400;
        throw error;
      }
    }

    for (let index = 0; index < orderedBlockIds.length; index++) {
      const blockId = orderedBlockIds[index];

      await blockRepository.update(
        blockId,
        {
          block_order: index + 1,
        },
        transaction
      );
    }

    return await blockRepository.findByContentId(
      contentId
    );
  });
};

export {
    createBlock,
    getBlocksByContentId,
    updateBlock,
    deleteBlock,
    reorderBlocks
};