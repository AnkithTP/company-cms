import * as blockService from "./content-block.service.js";

const createBlock = async (req, res, next) => {
    try {
        const block = await blockService.createBlock(
            req.params.contentId,
            req.body
        );

        res.status(201).json({
            success: true,
            message: "Content block created successfully",
            data: block,
        });
    } catch (error) {
        next(error);
    }
};

const getBlocks = async (req, res, next) => {
    try {
        const blocks = await blockService.getBlocksByContentId(
            req.params.contentId
        );

        res.status(200).json({
            success: true,
            data: blocks,
        });
    } catch (error) {
        next(error);
    }
};

const updateBlock = async (req, res, next) => {
    try {
        const block = await blockService.updateBlock(
            req.params.blockId,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Content block updated successfully",
            data: block,
        });
    } catch (error) {
        next(error);
    }
};

const deleteBlock = async (req, res, next) => {
    try {
        await blockService.deleteBlock(req.params.blockId);

        res.status(200).json({
            success: true,
            message: "Content block deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

const reorderBlocks = async (req, res, next) => {
    try {
        const blocks = await blockService.reorderBlocks(
            req.params.contentId,
            req.body.block_ids
        );

        res.status(200).json({
            success: true,
            message: "Content blocks reordered successfully",
            data: blocks,
        });
    } catch (error) {
        next(error);
    }
};

export {
    createBlock,
    getBlocks,
    updateBlock,
    deleteBlock,
    reorderBlocks
};