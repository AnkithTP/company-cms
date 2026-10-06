import * as portalService
    from "./portal.service.js";

export const getPortalContents = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await portalService.getPortalContents(
                req.query
            );

        res.status(200).json({
            success: true,
            data: result.data,
            pagination: result.pagination,
        });
    } catch (error) {
        next(error);
    }
};

export const getPortalContentBySlug = async (
    req,
    res,
    next
) => {
    try {
        const content =
            await portalService.getPortalContentBySlug(
                req.params.slug
            );

        res.status(200).json({
            success: true,
            data: content,
        });
    } catch (error) {
        next(error);
    }
};