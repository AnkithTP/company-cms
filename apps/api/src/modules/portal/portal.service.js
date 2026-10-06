import * as portalRepository
    from "./portal.repository.js";

export const getPortalContents = async (
    filters
) => {
    const page = Math.max(
        Number(filters.page) || 1,
        1
    );

    const limit = Math.min(
        Math.max(
            Number(filters.limit) || 10,
            1
        ),
        50
    );

    const result =
        await portalRepository.findPublishedContents({
            search: filters.search,
            content_type: filters.content_type,
            category_id: filters.category_id,

            page,
            limit,
        });

    return {
        data: result.rows,

        pagination: {
            page,
            limit,
            total: result.count,
            totalPages: Math.ceil(
                result.count / limit
            ),
        },
    };
};

export const getPortalContentBySlug = async (
    slug
) => {
    const content =
        await portalRepository.findPublishedBySlug(
            slug
        );

    if (!content) {
        const error = new Error(
            "Published content not found"
        );

        error.statusCode = 404;

        throw error;
    }

    return content;
};