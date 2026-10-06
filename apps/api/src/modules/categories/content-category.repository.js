import { ContentCategory } from "../../database/models.js";

export const findByContentId = async (contentId, transaction = null) => {
    return ContentCategory.findAll({
        where: {
            content_id: contentId,
        },
        transaction,
    });
};

export const replaceCategories = async (
    contentId,
    categoryIds,
    transaction
) => {
    await ContentCategory.destroy({
        where: {
            content_id: contentId,
        },
        transaction,
    });

    if (categoryIds.length === 0) {
        return [];
    }

    const records = categoryIds.map((categoryId) => ({
        content_id: contentId,
        category_id: categoryId,
    }));

    return ContentCategory.bulkCreate(records, {
        transaction,
    });
};