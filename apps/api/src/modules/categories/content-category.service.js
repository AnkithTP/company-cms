import sequelize from "../../config/database.js";
import * as categoryRepository from "./category.repository.js";
import * as contentCategoryRepository from "./content-category.repository.js";
import * as contentRepository from "../content/content.repository.js";

export const assignCategoriesToContent = async (
    contentId,
    categoryIds
) => {
    return sequelize.transaction(async (transaction) => {

        // 1. Check content exists
        const content = await contentRepository.findById(
            contentId,
            transaction
        );

        if (!content) {
            const error = new Error("Content not found");
            error.statusCode = 404;
            throw error;
        }

        // 2. Check categories exist
        for (const categoryId of categoryIds) {
            const category = await categoryRepository.findById(
                categoryId
            );

            if (!category) {
                const error = new Error(
                    `Category not found: ${categoryId}`
                );

                error.statusCode = 404;
                throw error;
            }
        }

        // 3. Replace existing assignments
        await contentCategoryRepository.replaceCategories(
            contentId,
            categoryIds,
            transaction
        );

        // 4. Return updated categories
        return contentCategoryRepository.findByContentId(
            contentId,
            transaction
        );
    });
};