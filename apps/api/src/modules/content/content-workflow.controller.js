import * as workflowService
    from "./content-workflow.service.js";

const submitContent = async (req, res, next) => {
    try {
        const content =
            await workflowService.submitContent(
                req.params.id
            );

        res.status(200).json({
            success: true,
            message: "Content submitted for review",
            data: content,
        });
    } catch (error) {
        next(error);
    }
};

const startReview = async (req, res, next) => {
    try {
        const content =
            await workflowService.startReview(
                req.params.id
            );

        res.status(200).json({
            success: true,
            message: "Content moved to review",
            data: content,
        });
    } catch (error) {
        next(error);
    }
};

 const approveContent = async (req, res, next) => {
    try {
        const content =
            await workflowService.approveContent(
                req.params.id,
                req.user.id
            );

        res.status(200).json({
            success: true,
            message: "Content approved successfully",
            data: content,
        });

    } catch (error) {
        next(error);
    }
};

 const rejectContent = async (
    req,
    res,
    next
) => {
    try {
        const data =
            await contentWorkflowService.rejectContent(
                req.params.id,
                req.user.id,
                req.body.reason
            );

        res.json({
            success: true,
            message: "Content rejected successfully",
            data
        });
    } catch (error) {
        next(error);
    }
};

const publishContent = async (req, res, next) => {
    try {
        const content =
            await workflowService.publishContent(
                req.params.id
            );

        res.status(200).json({
            success: true,
            message: "Content published successfully",
            data: content,
        });
    } catch (error) {
        next(error);
    }
};

const archiveContent = async (req, res, next) => {
    try {
        const content =
            await workflowService.archiveContent(
                req.params.id
            );

        res.status(200).json({
            success: true,
            message: "Content archived successfully",
            data: content,
        });
    } catch (error) {
        next(error);
    }
};

export {
    submitContent,
    startReview,
    approveContent,
    rejectContent,
    publishContent,
    archiveContent,
};