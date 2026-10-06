import * as revisionService from "./content-revision.service.js";

const createRevision = async (req, res, next) => {
    try {
        const revision = await revisionService.createRevision(
            req.params.contentId,
            req.user.id
        );

        res.status(201).json({
            success: true,
            message: "Content revision created successfully",
            data: revision,
        });
    } catch (error) {
        next(error);
    }
};

const getRevisions = async (req, res, next) => {
    try {
        const revisions = await revisionService.getRevisions(
            req.params.contentId
        );

        res.status(200).json({
            success: true,
            data: revisions,
        });
    } catch (error) {
        next(error);
    }
};

const getRevisionById = async (req, res, next) => {
    try {
        const revision = await revisionService.getRevisionById(
            req.params.revisionId
        );

        res.status(200).json({
            success: true,
            data: revision,
        });
    } catch (error) {
        next(error);
    }
};

const restoreRevision = async (req, res, next) => {
    try {
        const content = await revisionService.restoreRevision(
            req.params.contentId,
            req.params.revisionId,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Content revision restored successfully",
            data: content,
        });
    } catch (error) {
        next(error);
    }
};

export {
    createRevision,
    getRevisions,
    getRevisionById,
    restoreRevision,
};