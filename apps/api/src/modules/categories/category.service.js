import * as categoryRepository
    from "./category.repository.js";

const createCategory = async (categoryData) => {
    const existingSlug =
        await categoryRepository.findBySlug(
            categoryData.slug
        );

    if (existingSlug) {
        const error = new Error(
            "Category slug already exists"
        );
        error.statusCode = 409;
        throw error;
    }

    if (categoryData.parent_id) {
        const parent =
            await categoryRepository.findById(
                categoryData.parent_id
            );

        if (!parent) {
            const error = new Error(
                "Parent category not found"
            );
            error.statusCode = 404;
            throw error;
        }
    }

    return await categoryRepository.create(
        categoryData
    );
};

const getAllCategories = async () => {
    return await categoryRepository.findAll();
};

const getCategoryById = async (id) => {
    const category =
        await categoryRepository.findById(id);

    if (!category) {
        const error = new Error(
            "Category not found"
        );
        error.statusCode = 404;
        throw error;
    }

    return category;
};

const updateCategory = async (
    id,
    categoryData
) => {
    const category =
        await categoryRepository.findById(id);

    if (!category) {
        const error = new Error(
            "Category not found"
        );
        error.statusCode = 404;
        throw error;
    }

    if (
        categoryData.slug &&
        categoryData.slug !== category.slug
    ) {
        const existingSlug =
            await categoryRepository.findBySlug(
                categoryData.slug
            );

        if (existingSlug) {
            const error = new Error(
                "Category slug already exists"
            );
            error.statusCode = 409;
            throw error;
        }
    }

    if (categoryData.parent_id) {
        if (categoryData.parent_id === id) {
            const error = new Error(
                "A category cannot be its own parent"
            );
            error.statusCode = 400;
            throw error;
        }

        const parent =
            await categoryRepository.findById(
                categoryData.parent_id
            );

        if (!parent) {
            const error = new Error(
                "Parent category not found"
            );
            error.statusCode = 404;
            throw error;
        }
    }

    return await categoryRepository.update(
        id,
        categoryData
    );
};

const deleteCategory = async (id) => {
    const category =
        await categoryRepository.findById(id);

    if (!category) {
        const error = new Error(
            "Category not found"
        );
        error.statusCode = 404;
        throw error;
    }

    if (category.children && category.children.length > 0) {
        const error = new Error(
            "Cannot delete a category that has subcategories. Please reassign or delete the subcategories first."
        );
        error.statusCode = 400;
        throw error;
    }

    if (category.contents && category.contents.length > 0) {
        const error = new Error(
            `Cannot delete category because it is currently assigned to ${category.contents.length} article(s). Please remove or reassign the category from those articles first.`
        );
        error.statusCode = 400;
        throw error;
    }

    await categoryRepository.remove(id);
};

export {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};