import * as contentCategoryService from "./content-category.service.js";

export const assignCategories = async (req, res, next) => {
    try {
        const { category_ids } = req.body;

        const result =
            await contentCategoryService.assignCategoriesToContent(
                req.params.contentId,
                category_ids
            );

        res.status(200).json({
            success: true,
            message: "Categories assigned successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};